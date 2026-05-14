import { startBoss } from '@/lib/pg-boss'
import { KNOWLEDGE_INDEX_QUEUE } from '../constants'
import { handleProcessDoc } from './process-doc'

export type ProcessDocJob = {
  knowledgeDocId: string
  knowledgeId: string
  docId: string
  storageKey: string
  userId: string
  force?: boolean
}

export async function registerKnowledgeIndexWorkers() {
  const boss = await startBoss()

  await boss.createQueue(KNOWLEDGE_INDEX_QUEUE.PROCESS_DOC, {
    policy: 'stately'
  })

  await boss.work<ProcessDocJob>(
    KNOWLEDGE_INDEX_QUEUE.PROCESS_DOC,
    async jobs => {
      for (const job of jobs) {
        await handleProcessDoc(job.data)
      }
    }
  )
}
