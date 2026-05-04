import { OnChangeFn, RowSelectionState } from '@tanstack/react-table'
import { useState } from 'react'

export function useTableSelection<T extends { id: string }>(data: T[]) {
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedLength = selectedIds.length

  const pageIds = new Set(data.map(item => item.id))
  const rowSelection = selectedIds.reduce<RowSelectionState>(
    (selection, id) => {
      if (pageIds.has(id)) {
        selection[id] = true
      }

      return selection
    },
    {}
  )

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const nextSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater

    setSelectedIds(previousIds => {
      const nextIds = new Set(previousIds)

      for (const id of pageIds) {
        nextIds.delete(id)
      }

      for (const [id, isSelected] of Object.entries(nextSelection)) {
        if (isSelected) {
          nextIds.add(id)
        }
      }

      return Array.from(nextIds)
    })
  }

  const clearSelection = () => setSelectedIds([])

  const handleToggle = () => {
    if (isBulkMode) clearSelection()
    setIsBulkMode(v => !v)
  }

  return {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    selectedLength,
    rowSelection,
    onRowSelectionChange,
    clearSelection,
    handleToggle
  }
}
