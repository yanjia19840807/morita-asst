'use client'

import { Input } from '@/components/ui/input'
import { useAgentParams } from '@/hooks/use-agent-params'

export default function AgentSearch() {
  const { searchValue, setSearchValue } = useAgentParams()

  return (
    <Input
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
      value={searchValue}
      onChange={event => setSearchValue(event.target.value || null)}
      placeholder='搜索助手名称或描述'
      className='w-full sm:max-w-sm'
    />
  )
}
