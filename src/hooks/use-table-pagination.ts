import { parseAsInteger, useQueryState } from 'nuqs'
import { useTransition } from 'react'

export function useTablePagination() {
  const [, startTransition] = useTransition()
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
