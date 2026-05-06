import { AgentCreateForm } from '@/components/agent/agent-create-form'
import { fetchAgentFormOptions } from '@/data-access/agent'

export default function AgentCreatePage() {
  const optionsPromise = fetchAgentFormOptions()

  return (
    <div className='px-4'>
      <AgentCreateForm optionsPromise={optionsPromise} />
    </div>
  )
}
