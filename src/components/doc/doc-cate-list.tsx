'use client'

import { ScrollArea } from '../ui/scroll-area'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useDocumentsParams } from '@/hooks/use-documents-params'
import { DocumentCategory } from '@/generated/prisma/client'

export default function DocCateList({ cates }: { cates: DocumentCategory[] }) {
  const { categoryId, setCategoryId } = useDocumentsParams()

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-4 p-4'>
        {cates.map(cate => (
          <div key={cate.id}>
            <Link
              href='#'
              className={cn(
                'text-muted-foreground hover:text-foreground text-sm transition-colors',
                categoryId === cate.id && 'text-foreground font-medium'
              )}
              onClick={() => setCategoryId(cate.id)}
            >
              {cate.name}
            </Link>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
