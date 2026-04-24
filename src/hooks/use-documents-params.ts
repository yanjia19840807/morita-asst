import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { startTransition } from 'react'

export function useDocumentsParams() {
  const [{ searchValue, page, sortBy, sortDirection }, setParams] =
    useQueryStates(
      {
        searchValue: parseAsString.withDefault(''),
        sortBy: parseAsString.withDefault('createdAt'),
        sortDirection: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
        page: parseAsInteger.withDefault(1)
      },
      {
        startTransition,
        shallow: false,
        history: 'push'
      }
    )

  const setSearchValue = (
    value: string,
    options?: Parameters<typeof setParams>[1]
  ) => {
    setParams({ searchValue: value, page: 1 }, options)
  }
  const setSortBy = (value: string) => {
    setParams({ sortBy: value, page: 1 })
  }
  const setSortDirection = (value: 'asc' | 'desc' | null) => {
    setParams({ sortDirection: value, page: 1 })
  }

  return {
    searchValue,
    page,
    sortBy,
    sortDirection,
    setSearchValue,
    setSortBy,
    setSortDirection
  }
}
