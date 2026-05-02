import { OnChangeFn, RowSelectionState } from '@tanstack/react-table'
import _ from 'lodash'
import { useMemo, useState } from 'react'

export function useTableSelection(data: { id: string }[]) {
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const rowSelection = useMemo(
    () =>
      _.transform(
        data,
        (acc: RowSelectionState, row, i) => {
          if (selectedIdSet.has(row.id)) acc[i] = true
        },
        {}
      ),
    [data, selectedIdSet]
  )

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const newSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    setSelectedIds(prev => {
      const ids = prev.filter(id => !data.some(row => row.id === id))
      _.each(newSelection, (checked, i) => {
        if (!checked) return
        const rowId = data[Number(i)]?.id
        if (rowId) ids.push(rowId)
      })
      return _.uniq(ids)
    })
  }

  const handleToggle = () => {
    if (isBulkMode) setSelectedIds([])
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
