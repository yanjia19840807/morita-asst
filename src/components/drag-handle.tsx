'use client'

import { Grip } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DragHandle({
  disabled = false,
  handleRef,
  className
}: {
  disabled?: boolean
  handleRef?: ((element: Element | null) => void) | null
  className?: string
}) {
  return (
    <button
      ref={disabled ? undefined : handleRef}
      type='button'
      className={cn(
        'text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      aria-label='拖拽排序'
      disabled={disabled}
    >
      <Grip className='size-4' />
    </button>
  )
}
