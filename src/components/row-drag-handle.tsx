'use client'

import { GripVertical } from 'lucide-react'
import { useRowDragHandleRef } from './draggable-row'

export default function RowDragHandle({
  disabled = false
}: {
  disabled?: boolean
}) {
  const handleRef = useRowDragHandleRef()

  return (
    <button
      ref={disabled ? undefined : handleRef}
      type='button'
      className='text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40'
      aria-label='拖拽排序'
      disabled={disabled}
    >
      <GripVertical className='size-4' />
    </button>
  )
}
