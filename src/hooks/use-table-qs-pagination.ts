import { parseAsInteger, useQueryState } from 'nuqs'
import { startTransition } from 'react'

export function useTableQsPagination() {
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({
      startTransition,
      shallow: false,
      history: 'push'
    })
  )

  return {
    page,
    setPage
  }
}
