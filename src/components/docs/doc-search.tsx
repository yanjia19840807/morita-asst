'use client'

import { Input } from '@/components/ui/input'
import { useDocumentsParams } from '@/hooks/use-documents-params'

export default function DocSearch() {
  const { filename, setFilename } = useDocumentsParams()

  return (
    <Input
      onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
      value={filename}
      onChange={e => setFilename(e.target.value || null)}
      placeholder='搜索文档名称'
      className='w-1/2'
    />
  )
}
