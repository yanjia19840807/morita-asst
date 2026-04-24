import {
  debounce,
  parseAsString,
  parseAsStringEnum,
  useQueryStates
} from 'nuqs'
import { useTransition } from 'react'

export function useUserParams() {
  const [, startTransition] = useTransition()
  const [{ searchValue, searchField, page }, setParams] = useQueryStates(
    {
      searchValue: parseAsString.withDefault(''),
      searchField: parseAsStringEnum(['name', 'email'] as const).withDefault(
        'name'
      ),
      page: parseAsString
    },
    {
      shallow: false,
      startTransition,
      history: 'push',
      limitUrlUpdates: debounce(250)
    }
  )

  const setSearchValue = (value: string | null) => {
    setParams({ searchValue: value, page: null })
  }

  const setSearchField = (value: 'name' | 'email') => {
    setParams({ searchField: value, page: null })
  }

  return {
    searchValue,
    searchField,
    page,
    setSearchValue,
    setSearchField,
    setParams
  }
}
