import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { startTransition } from 'react'

export function useTableSort() {
  const [{ sortBy, sortDirection }, setSortParams] = useQueryStates(
    {
      sortBy: parseAsString,
      sortDirection: parseAsStringEnum(['asc', 'desc'])
    },
    { shallow: false, startTransition, history: 'push' }
  )

  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortDirection === 'desc' }]
    : []

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    if (newSorting.length > 0) {
      setSortParams({
        sortBy: newSorting[0].id,
        sortDirection: newSorting[0].desc ? 'desc' : 'asc'
      })
    } else {
      setSortParams({ sortBy: null, sortDirection: null })
    }
  }

  return {
    sortBy,
    sortDirection,
    setSortParams,
    sorting,
    onSortingChange
  }
}
