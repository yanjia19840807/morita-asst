import { debounce, parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { startTransition } from 'react'

export function useAgentParams() {
  const [{ searchValue, page }, setParams] = useQueryStates(
    {
      searchValue: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1)
    },
    {
      startTransition,
      shallow: false,
      history: 'push',
      limitUrlUpdates: debounce(250)
    }
  )

  const setSearchValue = (value: string | null) => {
    setParams({ searchValue: value, page: 1 })
  }

  return {
    searchValue,
    page,
    setSearchValue
  }
}
