'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/react/sortable'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortableIssueCardProps = {
  issueId: string
  index: number
  disabled?: boolean
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function SortableIssueCard({
  issueId,
  index,
  disabled = false,
  title,
  actions,
  children
}: SortableIssueCardProps) {
  const { ref, sourceRef, targetRef, handleRef, isDragging } = useSortable({
    id: issueId,
    index,
    disabled,
    modifiers: [RestrictToVerticalAxis]
  })

  const cardRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      ref(element)
      sourceRef(element)
      targetRef(element)
    },
    [ref, sourceRef, targetRef]
  )

  return (
    <div
      ref={cardRef}
      className={cn('rounded-md border p-4', isDragging ? 'opacity-50' : '')}
      style={{
        position: isDragging ? 'relative' : undefined,
        zIndex: isDragging ? 10 : undefined
      }}
    >
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            ref={handleRef}
            className='text-muted-foreground hover:text-foreground inline-flex cursor-grab items-center justify-center rounded-sm p-1 active:cursor-grabbing'
            aria-label={`拖动排序 ${title}`}
            disabled={disabled}
          >
            <GripVertical className='size-4' />
          </button>
          <div className='text-sm font-medium'>{title}</div>
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
