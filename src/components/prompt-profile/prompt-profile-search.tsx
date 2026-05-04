'use client'

import { Input } from '@/components/ui/input'
import { usePromptProfileParams } from '@/hooks/use-prompt-profile-params'

export default function PromptProfileSearch() {
  const { searchValue, setSearch } = usePromptProfileParams()

  return (
    <div className='flex w-1/2 flex-row gap-2'>
      <Input
        onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
        value={searchValue}
        onChange={event => setSearch(event.target.value || null)}
        placeholder='搜索提示词名称或正文内容'
      />
    </div>
  )
}
