'use client'

import { Input } from '@/components/ui/input'
import { useKnowledgeParams } from '@/hooks/use-knowledge-params'

export default function KnowledgeSearch() {
  const { searchValue, setSearchValue } = useKnowledgeParams()

  return (
    <Input
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
      value={searchValue}
      onChange={event => setSearchValue(event.target.value || null)}
      placeholder='搜索知识库名称或描述'
      className='w-full sm:max-w-sm'
    />
  )
}