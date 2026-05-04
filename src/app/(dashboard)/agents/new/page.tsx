import { AgentCreateForm } from '@/components/agent/agent-create-form'
import { fetchAgentFormOptions } from '@/data-access/agent'

export default function AgentCreatePage() {
  const optionsPromise = fetchAgentFormOptions()

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-4'>
      <AgentCreateForm optionsPromise={optionsPromise} />
    </div>
  )
}
