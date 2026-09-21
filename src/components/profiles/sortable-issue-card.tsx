'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/react/sortable'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DragHandle } from '@/components/drag-handle'

type SortableIssueItemProps = {
  issueId: string
  index: number
  disabled?: boolean
  label: React.ReactNode
  onRemove?: () => void
  children: React.ReactNode
}

export function SortableIssueItem({
  issueId,
  index,
  disabled = false,
  label,
  onRemove,
  children
}: SortableIssueItemProps) {
  const { ref, sourceRef, targetRef, handleRef, isDragging } = useSortable({
    id: issueId,
    index,
    disabled,
    modifiers: [RestrictToVerticalAxis]
  })

  const itemRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      ref(element)
      sourceRef(element)
      targetRef(element)
    },
    [ref, sourceRef, targetRef]
  )

  return (
    <div
      ref={itemRef}
      className={cn('flex flex-col gap-3', isDragging && 'opacity-50')}
      style={{
        position: isDragging ? 'relative' : undefined,
        zIndex: isDragging ? 10 : undefined
      }}
    >
      <div className='flex items-center gap-2'>
        <DragHandle disabled={disabled} handleRef={handleRef} />
        <div className='min-w-0 flex-1'>{label}</div>
        {onRemove ? (
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='text-muted-foreground'
            onClick={onRemove}
            disabled={disabled}
            aria-label='删除问题'
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>
      <div className='flex flex-col gap-3 pl-10 pr-10'>{children}</div>
    </div>
  )
}
