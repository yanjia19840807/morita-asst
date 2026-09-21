import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { createChatModel } from '../models/chat-deep-seek'
import {
  findKnowledgeChunksForRetrieve,
  findReadyKnowledgeDocs
} from './repository'
import type { ChatCitation } from './schemas'

const RETRIEVE_TOP_K = 4
const CANDIDATE_LIMIT = 24
const EXCERPT_LENGTH = 160
const CONTEXT_LENGTH = 800

const selectionSchema = z.object({
  ids: z.array(z.string())
})

function clip(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}…`
}

async function selectChunksWithDeepSeek(
  query: string,
  candidates: Array<{ id: string; filename: string; excerpt: string }>,
  model?: string | null
) {
  const selector = createChatModel(model, {
    modelKwargs: {
      thinking: { type: 'disabled' }
    }
  }).withStructuredOutput(selectionSchema)

  const selected = await selector.invoke([
    new SystemMessage(
      '你是知识库检索助手。根据用户问题，从候选片段中选出最相关的条目。最多选 4 个，按相关性从高到低。'
    ),
    new HumanMessage(
      `问题：\n${query}\n\n候选：\n${candidates
        .map(
          (item, index) =>
            `[${index + 1}] id=${item.id} 文件=${item.filename}\n${item.excerpt}`
        )
        .join('\n\n')}`
    )
  ])

  return selected.ids
}

export type RetrievedContext = {
  citations: ChatCitation[]
  contextText: string
}

export async function retrieveKnowledgeContext(
  knowledgeId: string,
  query: string,
  model?: string | null
): Promise<RetrievedContext> {
  const knowledgeDocs = await findReadyKnowledgeDocs(knowledgeId)
  const docIds = knowledgeDocs.map(item => item.id)

  if (docIds.length === 0) {
    return { citations: [], contextText: '' }
  }

  const docsById = new Map(
    knowledgeDocs.map(item => [item.id, item.doc] as const)
  )
  const candidates = await findKnowledgeChunksForRetrieve(
    docIds,
    query,
    CANDIDATE_LIMIT
  )

  if (candidates.length === 0) {
    return { citations: [], contextText: '' }
  }

  const candidateViews = candidates.map(chunk => ({
    id: chunk.id,
    filename: docsById.get(chunk.knowledgeDocId)?.filename ?? '未命名文档',
    excerpt: clip(chunk.content, EXCERPT_LENGTH),
    content: chunk.content,
    knowledgeDocId: chunk.knowledgeDocId
  }))

  let selected = candidateViews.slice(0, RETRIEVE_TOP_K)

  if (candidateViews.length > RETRIEVE_TOP_K) {
    try {
      const selectedIds = await selectChunksWithDeepSeek(
        query,
        candidateViews,
        model
      )
      const selectedSet = new Set(selectedIds)
      const picked = candidateViews.filter(item => selectedSet.has(item.id))

      if (picked.length > 0) {
        selected = picked.slice(0, RETRIEVE_TOP_K)
      }
    } catch (error) {
      console.error('DeepSeek retrieve selection failed:', error)
    }
  }

  const citations: ChatCitation[] = selected.map(item => ({
    chunkId: item.id,
    docId: docsById.get(item.knowledgeDocId)?.id,
    filename: item.filename,
    excerpt: item.excerpt
  }))
  const contextText = selected
    .map(
      (item, index) =>
        `[${index + 1}] ${item.filename}\n${clip(item.content, CONTEXT_LENGTH)}`
    )
    .join('\n\n')

  return { citations, contextText }
}
