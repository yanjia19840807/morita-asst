import { KnowledgeDocStatus } from '@/generated/prisma/client'
import { NotFoundError, ValidationError } from '@/lib/api/errors'
import { startBoss } from '@/lib/pg-boss'
import { requireRoles } from '@/modules/auth/service'
import {
  findKnowledgeDocStatusCounts,
  findKnowledgeDocIngestTarget,
  findKnowledgeIngestTarget,
  type KnowledgeDocIngestTarget,
  type KnowledgeIngestTarget
} from '../repository'
import { KNOWLEDGE_INDEX_QUEUE } from './constants'
import { ProcessDocJob } from './workers/register'

export { type KnowledgeDocIngestTarget, type KnowledgeIngestTarget }

export type KnowledgeIndexSummary = {
  knowledgeId: string
  total: number
  ready: number
  processing: number
  failed: number
  counts: Record<KnowledgeDocStatus, number>
}

export type SendKnowledgeResult = {
  jobIds: Array<string | null>
  knowledgeId: string
  docsCount: number
}

export type SendKnowledgeDocResult = {
  jobId: string | null
  knowledgeDocId: string
  knowledgeId: string
  currentStatus: KnowledgeDocStatus
}

const knowledgeDocStatusCounts = {
  [KnowledgeDocStatus.PENDING]: 0,
  [KnowledgeDocStatus.LOADING]: 0,
  [KnowledgeDocStatus.SPLITTING]: 0,
  [KnowledgeDocStatus.EMBEDDING]: 0,
  [KnowledgeDocStatus.READY]: 0,
  [KnowledgeDocStatus.FAILED]: 0
} satisfies Record<KnowledgeDocStatus, number>

const processingStatuses = new Set<KnowledgeDocStatus>([
  KnowledgeDocStatus.LOADING,
  KnowledgeDocStatus.SPLITTING,
  KnowledgeDocStatus.EMBEDDING
])

function isKnowledgeDocProcessing(status: KnowledgeDocStatus) {
  return processingStatuses.has(status)
}

export async function sendKnowledgeIngest(
  knowledgeId: string
): Promise<SendKnowledgeResult> {
  const user = await requireRoles(['admin'])

  const knowledge = await findKnowledgeIngestTarget(knowledgeId)
  if (!knowledge) {
    throw new NotFoundError('Knowledge')
  }

  if (knowledge.knowledgeDocs.length === 0) {
    throw new NotFoundError('knowledgeDocs')
  }

  const queuedKnowledgeDocs = knowledge.knowledgeDocs.filter(
    knowledgeDoc => !isKnowledgeDocProcessing(knowledgeDoc.status)
  )

  if (queuedKnowledgeDocs.length === 0) {
    throw new ValidationError('当前知识库已有索引任务在执行，请稍后再试')
  }

  const boss = await startBoss()
  const jobIds = await Promise.all(
    queuedKnowledgeDocs.map(knowledgeDoc => {
      const job: ProcessDocJob = {
        knowledgeDocId: knowledgeDoc.id,
        knowledgeId: knowledge.id,
        docId: knowledgeDoc.doc.id,
        storageKey: knowledgeDoc.doc.storageKey,
        userId: user.id
      }

      return boss.send(KNOWLEDGE_INDEX_QUEUE.PROCESS_DOC, job, {
        singletonKey: knowledgeDoc.id
      })
    })
  )

  if (jobIds.every(jobId => jobId === null)) {
    throw new ValidationError('当前知识库已有索引任务在执行，请稍后再试')
  }

  return {
    jobIds,
    knowledgeId: knowledge.id,
    docsCount: queuedKnowledgeDocs.length
  }
}

export async function sendKnowledgeDocReindex(
  knowledgeDocId: string
): Promise<SendKnowledgeDocResult> {
  const user = await requireRoles(['admin'])

  const knowledgeDoc = await findKnowledgeDocIngestTarget(knowledgeDocId)
  if (!knowledgeDoc) {
    throw new NotFoundError('KnowledgeDoc')
  }

  if (isKnowledgeDocProcessing(knowledgeDoc.status)) {
    throw new ValidationError('该文档正在索引中，请稍后再试')
  }

  const boss = await startBoss()
  const job: ProcessDocJob = {
    knowledgeDocId: knowledgeDoc.id,
    knowledgeId: knowledgeDoc.knowledgeId,
    docId: knowledgeDoc.doc.id,
    storageKey: knowledgeDoc.doc.storageKey,
    userId: user.id,
    force: true
  }
  const jobId = await boss.send(KNOWLEDGE_INDEX_QUEUE.PROCESS_DOC, job, {
    singletonKey: knowledgeDoc.id
  })

  if (!jobId) {
    throw new ValidationError('该文档正在索引中，请稍后再试')
  }

  return {
    jobId,
    knowledgeDocId: knowledgeDoc.id,
    knowledgeId: knowledgeDoc.knowledgeId,
    currentStatus: knowledgeDoc.status
  }
}

export async function fetchKnowledgeIndexSummary(
  knowledgeId: string
): Promise<KnowledgeIndexSummary> {
  await requireRoles(['admin'])

  const grouped = await findKnowledgeDocStatusCounts(knowledgeId)

  if (!grouped) {
    throw new NotFoundError('Knowledge')
  }

  const counts: Record<KnowledgeDocStatus, number> = {
    ...knowledgeDocStatusCounts
  }

  for (const item of grouped) {
    counts[item.status] = item.count
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return {
    knowledgeId,
    total,
    ready: counts[KnowledgeDocStatus.READY],
    processing:
      counts[KnowledgeDocStatus.LOADING] +
      counts[KnowledgeDocStatus.SPLITTING] +
      counts[KnowledgeDocStatus.EMBEDDING],
    failed: counts[KnowledgeDocStatus.FAILED],
    counts
  }
}
