'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useUserParams } from '@/hooks/use-user-params'

export default function UserSearch() {
  const { searchValue, searchField, setSearch } = useUserParams()

  return (
    <div className='flex w-1/2 flex-row gap-2'>
      <Select
        value={searchField}
        onValueChange={value => {
          setSearch(value as 'name' | 'email', searchValue)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='name'>用户名</SelectItem>
          <SelectItem value='email'>邮箱</SelectItem>
        </SelectContent>
      </Select>
      <Input
        onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
        value={searchValue}
        onChange={e => setSearch(searchField, e.target.value || null)}
        placeholder={searchField === 'name' ? '搜索用户名' : '搜索邮箱'}
      />
    </div>
  )
}
