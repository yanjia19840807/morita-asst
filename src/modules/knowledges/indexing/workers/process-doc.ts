import { randomUUID } from 'crypto'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { unlink } from 'fs/promises'
import type { Prisma } from '@/generated/prisma/client'
import { getVectorStore } from '@/lib/vector-store'
import {
  replaceKnowledgeDocChunks,
  updateKnowledgeDocFailed,
  updateKnowledgeDocReady,
  updateKnowledgeDocStatus
} from '../../repository'
import { downloadFile } from '@/modules/oss/server'
import type { ProcessDocJob } from './register'

export async function handleProcessDoc(job: ProcessDocJob) {
  try {
    await updateKnowledgeDocStatus(job.knowledgeDocId, 'LOADING')

    const filePath = await downloadFile(job.storageKey)
    const loader = new PDFLoader(filePath)
    const loadedDocs = await loader.load()
    const docs: Document[] = loadedDocs.map(
      item =>
        new Document({
          pageContent: item.pageContent,
          metadata: {
            ...item.metadata,
            source: job.storageKey,
            docId: job.docId,
            knowledgeDocId: job.knowledgeDocId
          }
        })
    )

    await unlink(filePath).catch(() => undefined)

    await updateKnowledgeDocStatus(job.knowledgeDocId, 'SPLITTING')

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
    const documents = await textSplitter.splitDocuments(docs)

    const chunks = documents.map(document => ({
      id: randomUUID(),
      content: document.pageContent,
      metadata: document.metadata as Prisma.InputJsonValue
    }))

    await replaceKnowledgeDocChunks(job.knowledgeDocId, chunks)
    await updateKnowledgeDocStatus(job.knowledgeDocId, 'EMBEDDING')

    const vectorStore = await getVectorStore()
    await vectorStore.addModels(
      chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        metadata: chunk.metadata as Prisma.JsonValue,
        knowledgeDocId: job.knowledgeDocId
      }))
    )

    await updateKnowledgeDocReady(job.knowledgeDocId, chunks.length)
    return chunks
  } catch (error) {
    const message = error instanceof Error ? error.message : '文档处理失败'
    await updateKnowledgeDocFailed(job.knowledgeDocId, message)
    throw error
  }
}
