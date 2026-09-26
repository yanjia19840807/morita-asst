import { AgentChat } from '@/components/agents/agent-chat'
import { PageShell } from '@/components/layout/page-shell'
import { fetchAgentById } from '@/modules/agents/service'

export default async function AgentChatPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await fetchAgentById(id)

  return (
    <PageShell>
      <AgentChat
        agentId={agent.id}
        agentName={agent.name}
        status={agent.status}
        model={agent.model}
        temperature={agent.temperature}
        historyLimit={agent.historyLimit}
        retrieveTopK={agent.retrieveTopK}
        knowledgeName={agent.knowledge?.name ?? null}
        promptName={agent.promptProfile?.name ?? null}
      />
    </PageShell>
  )
}
