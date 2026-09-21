'use client'

import { useQuery } from '@tanstack/react-query'
import { docCatesQueryKey, fetchSelectDocCates } from '@/modules/docs/client'
import { getErrorMessage } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { FieldLabel, FieldTitle } from '@/components/ui/field'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DocCatePickerProps {
  selectedCategoryId?: string
  onSelectCategory: (id: string) => void
  disabled?: boolean
}

export function DocSelectCate({
  selectedCategoryId,
  onSelectCategory,
  disabled = false
}: DocCatePickerProps) {
  const catesQuery = useQuery({
    queryKey: docCatesQueryKey,
    queryFn: fetchSelectDocCates
  })

  const categories = catesQuery.data ?? []
  const error = catesQuery.error ? getErrorMessage(catesQuery.error) : null

  return (
    <aside className='bg-muted/20 flex w-56 shrink-0 flex-col border-r'>
      <div className='border-b px-4 py-3'>
        <FieldLabel>
          <FieldTitle>类目</FieldTitle>
        </FieldLabel>
      </div>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='flex flex-col gap-1 p-3'>
          {error ? (
            <div className='text-destructive px-1 text-sm'>{error}</div>
          ) : null}
          {categories.length === 0 && !error ? (
            <div className='text-muted-foreground px-1 py-2 text-sm'>
              暂无类目
            </div>
          ) : null}
          {categories.map(category => (
            <button
              key={category.id}
              type='button'
              className={cn(
                'hover:bg-muted/80 rounded-md px-3 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-50',
                selectedCategoryId === category.id
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onSelectCategory(category.id)}
              disabled={disabled}
            >
              {category.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
