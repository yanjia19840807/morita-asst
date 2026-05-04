'use client'

import { useSortable } from '@dnd-kit/react/sortable'
import React from 'react'
import { cn } from '@/lib/utils'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'

const RowDragHandleContext = React.createContext<
  ((element: Element | null) => void) | null
>(null)

export function useRowDragHandleRef() {
  return React.useContext(RowDragHandleContext)
}

type DragEndEventProps = {
  rowId: string
  index: number
  disabled?: boolean
  className?: string
  children: React.ReactNode
} & React.ComponentProps<'tr'>

function DraggableRow({
  rowId,
  index,
  disabled = false,
  className,
  children,
  ...props
}: DragEndEventProps) {
  const { ref, sourceRef, targetRef, handleRef, isDragging } = useSortable({
    id: rowId,
    index,
    disabled,
    modifiers: [RestrictToVerticalAxis]
  })

  const rowRef = React.useCallback(
    (element: HTMLTableRowElement | null) => {
      ref(element)
      sourceRef(element)
      targetRef(element)
    },
    [ref, sourceRef, targetRef]
  )

  const style = {
    opacity: isDragging ? 0.5 : disabled ? 0.7 : 1,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 10 : undefined
  } as React.CSSProperties

  return (
    <RowDragHandleContext.Provider value={handleRef}>
      <tr ref={rowRef} style={style} className={cn(className)} {...props}>
        {children}
      </tr>
    </RowDragHandleContext.Provider>
  )
}

export default DraggableRow
