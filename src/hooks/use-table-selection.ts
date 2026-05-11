import { OnChangeFn, RowSelectionState } from '@tanstack/react-table'
import { useState } from 'react'

export function useTableSelection(ids: string[]) {
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedLength = selectedIds.length

  const rowSelection = selectedIds.reduce<RowSelectionState>(
    (selection, id) => {
      if (ids.includes(id)) {
        selection[id] = true
      }

      return selection
    },
    {}
  )

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const nextSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    const nextPageSelectedIds = Object.entries(nextSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id)

    setSelectedIds(previousIds => {
      const preservedIds = previousIds.filter(id => !ids.includes(id))
      return [...preservedIds, ...nextPageSelectedIds]
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
