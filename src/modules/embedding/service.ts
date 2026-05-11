import 'server-only'

import { Document } from '@langchain/core/documents'
import { unlink } from 'fs/promises'
import { createRequire } from 'module'
import { downloadFile } from '../oss/server'
import type { DocRow } from '../docs'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { vectorStore } from '@/lib/vector-store'

const require = createRequire(import.meta.url)

const loadPdfLoaderImports = async () => {
  const { PDFParse } = require('pdf-parse') as typeof import('pdf-parse')

  return {
    isV2: true as const,
    PDFParse
  }
}

export async function embedDoc(
  doc: Pick<DocRow, 'id' | 'storageKey'>
): Promise<void> {
  const filePath = await downloadFile(doc.storageKey)

  let docs: Document[] = []

  try {
    const { PDFLoader } =
      await import('@langchain/community/document_loaders/fs/pdf')

    const loader = new PDFLoader(filePath, {
      pdfjs: loadPdfLoaderImports
    })

    docs = (await loader.load()).map(
      document =>
        new Document({
          pageContent: document.pageContent,
          metadata: {
            ...document.metadata,
            source: doc.storageKey,
            docId: doc.id
          }
        })
    )
  } finally {
    await unlink(filePath).catch(() => undefined)
  }

  if (docs.length === 0) {
    return
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })

  const documents = await textSplitter.splitDocuments(docs)
  await vectorStore.addDocuments(documents)
}
