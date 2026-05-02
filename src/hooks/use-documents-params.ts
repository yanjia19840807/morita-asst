import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { startTransition } from 'react'

export function useDocumentsParams() {
  const [{ categoryId, filename, page, sortBy, sortDirection }, setParams] =
    useQueryStates(
      {
        categoryId: parseAsString,
        filename: parseAsString.withDefault(''),
        sortBy: parseAsString.withDefault('createdAt'),
        sortDirection: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
        page: parseAsInteger.withDefault(1)
      },
      {
        startTransition,
        shallow: false,
        history: 'push',
        limitUrlUpdates: debounce(250)
      }
    )

  const setFilename = (value: string | null) => {
    setParams({ filename: value, page: 1 })
  }

  const setCategoryId = (value: string | null) => {
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
    filename,
    page,
    sortBy,
    sortDirection,
    setCategoryId,
    setFilename,
    setSorting
  }
}
