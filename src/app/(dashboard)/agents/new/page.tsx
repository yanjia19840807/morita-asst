import { AgentCreateForm } from '@/components/agents/agent-create-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchAllKnowledges } from '@/modules/knowledges/service'
import { fetchAllPromptProfiles } from '@/modules/prompt-profiles/service'

export default function AgentCreatePage() {
  const promptPromise = fetchAllPromptProfiles()
  const knowledgePromise = fetchAllKnowledges()

  return (
    <PageShell>
      <AgentCreateForm
        promptPromise={promptPromise}
        knowledgePromise={knowledgePromise}
      />
    </PageShell>
  )
}
