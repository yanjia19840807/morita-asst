import { randomUUID } from 'crypto'
import { readFile } from 'node:fs/promises'
import JSZip from 'jszip'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TextLoader } from '@langchain/classic/document_loaders/fs/text'
import { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import type { Prisma } from '@/generated/prisma/client'
import {
  replaceKnowledgeDocChunks,
  updateKnowledgeDocFailed,
  updateKnowledgeDocReady,
  updateKnowledgeDocStatus
} from '../../repository'
import { resolveStoragePath } from '@/modules/storage/paths'
import type { ProcessDocJob } from './register'

function getStorageExtension(storageKey: string) {
  const filename = storageKey.split('/').pop() ?? storageKey
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

async function loadDocxDocuments(filePath: string) {
  const zip = await JSZip.loadAsync(await readFile(filePath))
  const documentXml = await zip.file('word/document.xml')?.async('string')

  if (!documentXml) {
    throw new Error('无法读取 Word 文档内容')
  }

  const pageContent = decodeXmlEntities(
    documentXml
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br[^/]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
  ).trim()

  if (!pageContent) {
    throw new Error('Word 文档没有可索引的文本')
  }

  return [new Document({ pageContent })]
}

async function loadSourceDocuments(filePath: string, storageKey: string) {
  const extension = getStorageExtension(storageKey)

  if (extension === 'pdf') {
    return new PDFLoader(filePath).load()
  }

  if (extension === 'docx' || extension === 'docm' || extension === 'dotx') {
    return loadDocxDocuments(filePath)
  }

  if (extension === 'txt' || extension === 'md') {
    return new TextLoader(filePath).load()
  }

  throw new Error(`暂不支持索引 .${extension || 'unknown'} 文件`)
}

export async function handleProcessDoc(job: ProcessDocJob) {
  try {
    await updateKnowledgeDocStatus(job.knowledgeDocId, 'LOADING')

    const filePath = resolveStoragePath(job.storageKey)
    const loadedDocs = await loadSourceDocuments(filePath, job.storageKey)
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
    await updateKnowledgeDocReady(job.knowledgeDocId, chunks.length)
    return chunks
  } catch (error) {
    const message = error instanceof Error ? error.message : '文档处理失败'
    await updateKnowledgeDocFailed(job.knowledgeDocId, message)
    throw error
  }
}
