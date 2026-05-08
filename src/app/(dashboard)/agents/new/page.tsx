import { AgentCreateForm } from '@/components/agents/agent-create-form'
import { fetchAllKnowledges } from '@/dal/knowledges'
import { fetchAllPromptProfiles } from '@/dal/prompt-profiles'

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
