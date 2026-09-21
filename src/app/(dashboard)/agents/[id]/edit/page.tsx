import { AgentCreateForm } from '@/components/agents/agent-create-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchAgentById } from '@/modules/agents/service'
import { fetchAllKnowledges } from '@/modules/knowledges/service'
import { fetchAllPromptProfiles } from '@/modules/prompt-profiles/service'

export default async function AgentEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agent = await fetchAgentById(id)
  const promptPromise = fetchAllPromptProfiles()
  const knowledgePromise = fetchAllKnowledges()

  return (
    <PageShell>
      <AgentCreateForm
        promptPromise={promptPromise}
        knowledgePromise={knowledgePromise}
        agent={{
          id: agent.id,
          name: agent.name,
          description: agent.description,
          status: agent.status,
          model: agent.model,
          promptProfileId: agent.promptProfileId,
          knowledgeId: agent.knowledgeId
        }}
      />
    </PageShell>
  )
}
