import { AgentDetail } from '@/components/agents/agent-detail'
import { PageShell } from '@/components/layout/page-shell'
import { fetchAgentById } from '@/modules/agents/service'

export default async function AgentDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await fetchAgentById(id)

  return (
    <PageShell>
      <AgentDetail agent={agent} />
    </PageShell>
  )
}
