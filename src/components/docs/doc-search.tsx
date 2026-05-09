'use client'

import { Input } from '@/components/ui/input'
import { useDocsParams } from '@/hooks/use-docs-params'

export default function DocSearch() {
  const { searchValue, setSearch } = useDocsParams()

  return (
    <Input
      onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
      value={searchValue}
      onChange={e => setSearch('filename', e.target.value || null)}
      placeholder='搜索文档名称'
      className='w-1/2'
    />
  )
}
