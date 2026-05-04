import {
  debounce,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { useTransition } from 'react'

export function usePromptProfileParams() {
  const [, startTransition] = useTransition()
  const [{ searchValue, page, sortBy, sortDirection }, setParams] =
    useQueryStates(
      {
        searchValue: parseAsString.withDefault(''),
        page: parseAsInteger.withDefault(1),
        sortBy: parseAsString.withDefault('updatedAt'),
        sortDirection: parseAsStringEnum(['asc', 'desc']).withDefault('desc')
      },
      {
        shallow: false,
        startTransition,
        history: 'push',
        limitUrlUpdates: debounce(250)
      }
    )

  const setSearch = (nextSearchValue: string | null) => {
    setParams({
      searchValue: nextSearchValue,
      page: 1
    })
  }

  return {
    searchValue,
    page,
    sortBy,
    sortDirection,
    setSearch
  }
}
