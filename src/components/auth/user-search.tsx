'use client'

import { Input } from '@/components/ui/input'
import { useUserParams } from '@/hooks/use-user-params'

export default function UserSearch() {
  const { searchValue, setSearchValue } = useUserParams()

  return (
    <Input
      onKeyDown={event => event.key === 'Enter' && event.currentTarget.blur()}
      value={searchValue}
      onChange={event => setSearchValue(event.target.value || null)}
      placeholder='搜索用户名或邮箱'
      className='max-w-sm'
    />
  )
}
