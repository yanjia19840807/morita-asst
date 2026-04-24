import { OnChangeFn, RowSelectionState } from '@tanstack/react-table'
import _ from 'lodash'
import { useMemo, useState } from 'react'

export function useTableSelection(data: { id: string }[]) {
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const rowSelection = useMemo(
    () =>
      _.transform(
        data,
        (acc: RowSelectionState, row, i) => {
          if (selectedIds.has(row.id)) acc[i] = true
        },
        {}
      ),
    [data, selectedIds]
  )

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const newSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    setSelectedIds(prev => {
      const ids = new Set(prev)
      _.each(data, row => ids.delete(row.id))
      _.each(newSelection, (checked, i) => {
        if (checked) ids.add(data[Number(i)].id)
      })
      return ids
    })
  }

  const handleToggle = () => {
    if (isBulkMode) setSelectedIds(new Set())
    setIsBulkMode(v => !v)
  }

  return {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    setSelectedIds,
    rowSelection,
    onRowSelectionChange,
    handleToggle
  }
}
