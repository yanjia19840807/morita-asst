import { stopBoss } from '@/lib/pg-boss'
import { registerKnowledgeIndexWorkers } from '@/modules/knowledges/indexing/workers/register'

let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  console.log(`[knowledge-index-worker] Received ${signal}, shutting down...`)

  try {
    await stopBoss()
    process.exit(0)
  } catch (error) {
    console.error(
      '[knowledge-index-worker] Failed to stop pg-boss cleanly:',
      error
    )
    process.exit(1)
  }
}

async function main() {
  await registerKnowledgeIndexWorkers()
  console.log(
    '[knowledge-index-worker] Workers registered and listening for jobs'
  )
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

void main().catch(async error => {
  console.error('[knowledge-index-worker] Failed to start:', error)

  try {
    await stopBoss()
  } finally {
    process.exit(1)
  }
})
