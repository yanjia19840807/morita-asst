import { AgentCreateForm } from '@/components/agents/agent-create-form'
import { fetchAllKnowledges } from '@/modules/knowledges/service'
import { fetchAllPromptProfiles } from '@/modules/prompt-profiles/service'

export default function AgentCreatePage() {
  const promptPromise = fetchAllPromptProfiles()
  const knowledgePromise = fetchAllKnowledges()

  return (
    <div className='px-4'>
      <AgentCreateForm
        promptPromise={promptPromise}
        knowledgePromise={knowledgePromise}
      />
    </div>
  )
}
