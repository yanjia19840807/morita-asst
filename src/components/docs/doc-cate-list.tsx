'use client'

import { ScrollArea } from '../ui/scroll-area'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useDocsParams } from '@/hooks/use-docs-params'
import { DocCate } from '@/generated/prisma/client'

export default function DocCateList({ data }: { data: DocCate[] }) {
  const { categoryId, setCategoryId } = useDocsParams()

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-4'>
        {data.map(item => (
          <div key={item.id}>
            <Link
              href='#'
              className={cn(
                'text-muted-foreground hover:text-foreground text-sm transition-colors',
                categoryId === item.id && 'text-foreground font-medium'
              )}
              onClick={() => setCategoryId(item.id)}
            >
              {item.name}
            </Link>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
