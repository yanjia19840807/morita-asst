import { debounce, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { useTransition } from 'react'

export function useUserParams() {
  const [, startTransition] = useTransition()
  const [{ searchValue, page, sortBy, sortDirection }, setParams] =
    useQueryStates(
      {
        searchValue: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
        sortBy: parseAsString.withDefault('createdAt'),
        sortDirection: parseAsStringEnum(['asc', 'desc'] as const).withDefault(
          'desc'
        )
      },
      {
        shallow: false,
        startTransition,
        history: 'push',
        limitUrlUpdates: debounce(250)
      }
    )

  const setSearchValue = (value: string | null) => {
    setParams({ searchValue: value, page: 1 })
  }

  const setSorting = (
    nextSortBy: string | null,
    nextSortDirection: 'asc' | 'desc' | null
  ) => {
    setParams({ sortBy: nextSortBy, sortDirection: nextSortDirection, page: 1 })
  }

  return {
    searchValue,
    page,
    sortBy,
    sortDirection,
    setSearchValue,
    setSorting
  }
}
