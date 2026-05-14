import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { debounce, parseAsString, useQueryStates } from 'nuqs'
import { startTransition } from 'react'
import { useTableQsPagination } from './use-table-qs-pagination'
import { useTableQsSort } from './use-table-qs-sort'

export function useChunkParams() {
  const { page, setPage } = useTableQsPagination()
  const { sorting, onSortingChange: baseOnSortingChange } = useTableQsSort()
  const [{ searchValue }, setParams] = useQueryStates(
    {
      searchValue: parseAsString.withDefault('')
    },
    {
      startTransition,
      shallow: false,
      history: 'push',
      limitUrlUpdates: debounce(250)
    }
  )

  const setSearchValue = (value: string | null) => {
    setParams({ searchValue: value }, { history: 'push' })
    setPage(1)
  }

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    baseOnSortingChange(updater)
    setPage(1)
  }

  return {
    page,
    setPage,
    searchValue,
    setSearchValue,
    sorting,
    onSortingChange
  }
}
