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
      <div className='flex flex-col gap-1'>
        {data.map(item => (
          <Link
            key={item.id}
            href='#'
            className={cn(
              'hover:bg-muted/80 rounded-md px-3 py-2 text-sm transition-colors',
              categoryId === item.id
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setCategoryId(item.id)}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </ScrollArea>
  )
}
