'use client'

import { useTableQsPagination } from '@/hooks/use-table-qs-pagination'
import TablePagination from './table-pagination'

interface TableQsPaginationProps {
  pageSize: number
  total: number
  className?: string
}

export function TableQsPagination({
  pageSize,
  total,
  className
}: TableQsPaginationProps) {
  const { page, setPage } = useTableQsPagination()

  return (
    <TablePagination
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      total={total}
      className={className}
    />
  )
}
