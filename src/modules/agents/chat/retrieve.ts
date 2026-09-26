import {
  countReadyKnowledgeChunks,
  findReadyChunksByTerms,
  findReadyKnowledgeDocs
} from './repository'
import type { ChatCitation } from './schemas'

const CANDIDATE_LIMIT = 80
const STORED_LENGTH = 1500

export type RetrievedContext = {
  status: 'hit' | 'miss'
  reason: string | null
  citations: ChatCitation[]
  contextText: string
}

function clip(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}…`
}

function searchTerms(query: string) {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(word => word.length >= 2 && !/[\u4e00-\u9fff]/.test(word))
  const cjk = query.match(/[\u4e00-\u9fff]+/g)?.join('') ?? ''
  const grams: string[] = []

  for (let index = 0; index < cjk.length - 1; index += 1) {
    grams.push(cjk.slice(index, index + 2))
  }

  const unique = [...new Set([...words, ...grams])]
  if (unique.length <= 16) {
    return unique
  }

  const step = unique.length / 16
  return Array.from({ length: 16 }, (_, index) => unique[Math.floor(index * step)])
}

function scoreChunk(content: string, terms: string[]) {
  const haystack = content.toLowerCase()
  return terms.reduce(
    (total, term) => (haystack.includes(term) ? total + 1 : total),
    0
  )
}

export async function retrieveKnowledgeContext(
  knowledgeId: string,
  query: string,
  topK: number
): Promise<RetrievedContext> {
  const knowledgeDocs = await findReadyKnowledgeDocs(knowledgeId)

  if (knowledgeDocs.length === 0) {
    return {
      status: 'miss',
      reason: '知识库没有已就绪的文档',
      citations: [],
      contextText: ''
    }
  }

  const docIds = knowledgeDocs.map(item => item.id)
  const chunkCount = await countReadyKnowledgeChunks(docIds)

  if (chunkCount === 0) {
    return {
      status: 'miss',
      reason: '已就绪文档还没有切片',
      citations: [],
      contextText: ''
    }
  }

  const terms = searchTerms(query)
  if (terms.length === 0) {
    return {
      status: 'miss',
      reason: '问题过短，无法在切片中检索',
      citations: [],
      contextText: ''
    }
  }

  const docsByKnowledgeDocId = new Map(
    knowledgeDocs.map(item => [item.id, item.doc] as const)
  )
  const candidates = await findReadyChunksByTerms(docIds, terms, CANDIDATE_LIMIT)
  const minimumScore = terms.length <= 2 ? 1 : 2
  const ranked = candidates
    .map(chunk => ({
      chunk,
      score: scoreChunk(chunk.content, terms)
    }))
    .filter(item => item.score >= minimumScore)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK)

  if (ranked.length === 0) {
    return {
      status: 'miss',
      reason: '已就绪切片里没有与问题相关的内容',
      citations: [],
      contextText: ''
    }
  }

  const citations: ChatCitation[] = ranked.map(({ chunk }) => {
    const doc = docsByKnowledgeDocId.get(chunk.knowledgeDocId)
    const content = clip(chunk.content, STORED_LENGTH)

    return {
      chunkId: chunk.id,
      docId: doc?.id ?? null,
      filename: doc?.filename ?? '未命名文档',
      excerpt: clip(chunk.content, 160),
      content
    }
  })
  const contextText = citations
    .map(
      (item, index) => `[${index + 1}] ${item.filename}\n${item.content ?? item.excerpt}`
    )
    .join('\n\n')

  return {
    status: 'hit',
    reason: null,
    citations,
    contextText
  }
}
