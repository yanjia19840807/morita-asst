'use client'

import { DragHandle } from './drag-handle'
import { useRowDragHandleRef } from './draggable-row'

export default function RowDragHandle({
  disabled = false
}: {
  disabled?: boolean
}) {
  const handleRef = useRowDragHandleRef()

  return <DragHandle disabled={disabled} handleRef={handleRef} />
}
