'use client'

import { Input } from '@/components/ui/input'
import { debounce } from 'nuqs'
import { useDocumentsParams } from '@/hooks/use-documents-params'

export default function DocumentSearch() {
  const { searchValue, setSearchValue } = useDocumentsParams()

  return (
    <div className='flex flex-row gap-2'>
      <Input
        onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
        value={searchValue}
        onChange={e =>
          setSearchValue(e.target.value, {
            limitUrlUpdates: e.target.value === '' ? undefined : debounce(500)
          })
        }
        placeholder='搜索文档名称'
        className='w-64'
      />
    </div>
  )
}
