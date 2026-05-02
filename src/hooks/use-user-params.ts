import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { useTransition } from 'react'

export function useUserParams() {
  const [, startTransition] = useTransition()
  const [{ searchValue, searchField, page, sortBy, sortDirection }, setParams] =
    useQueryStates(
      {
        searchValue: parseAsString.withDefault(''),
        searchField: parseAsStringEnum(['name', 'email'] as const).withDefault(
          'name'
        ),
        page: parseAsInteger.withDefault(1),
        sortBy: parseAsString.withDefault('createdAt'),
        sortDirection: parseAsStringEnum(['asc', 'desc']).withDefault('desc')
      },
      {
        shallow: false,
        startTransition,
        history: 'push',
        limitUrlUpdates: debounce(250)
      }
    )

  const setSearch = (
    searchField: 'name' | 'email' | null,
    searchValue: string | null
  ) => {
    setParams({ searchField, searchValue, page: 1 })
  }

  const setSorting = (
    nextSortBy: string | null,
    nextSortDirection: 'asc' | 'desc' | null
  ) => {
    setParams({ sortBy: nextSortBy, sortDirection: nextSortDirection, page: 1 })
  }

  return {
    searchValue,
    searchField,
    page,
    sortBy,
    sortDirection,
    setSearch,
    setSorting
  }
}
