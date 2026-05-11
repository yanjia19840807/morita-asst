import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { startTransition } from 'react'

export function useDocsParams() {
  const [
    { categoryId, searchField, searchValue, page, sortBy, sortDirection },
    setParams
  ] = useQueryStates(
    {
      categoryId: parseAsString,
      searchField: parseAsStringEnum(['filename'] as const).withDefault(
        'filename'
      ),
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

  const setSearch = (
    nextSearchField: 'filename' | null,
    nextSearchValue: string | null
  ) => {
    setParams(
      {
        searchField: nextSearchField,
        searchValue: nextSearchValue,
        page: 1
      },
      {
        limitUrlUpdates: debounce(500)
      }
    )
  }

  const setCategoryId = (value: string) => {
    setParams({ categoryId: value, page: 1 })
  }

  const setSorting = (
    nextSortBy: string | null,
    nextSortDirection: 'asc' | 'desc' | null
  ) => {
    setParams({ sortBy: nextSortBy, sortDirection: nextSortDirection, page: 1 })
  }

  return {
    categoryId,
    searchField,
    searchValue,
    page,
    sortBy,
    sortDirection,
    setCategoryId,
    setSearch,
    setSorting
  }
}
