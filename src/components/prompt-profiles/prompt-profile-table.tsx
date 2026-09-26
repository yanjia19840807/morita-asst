'use client'

import { type ColumnDef } from '@tanstack/react-table'
import TableActionSection from '../table/table-action-section'
import { DataTable } from '../table/data-table'
import { TableQsPagination } from '../table/table-qs-pagination'
import PromptProfileSearch from './prompt-profile-search'
import { promptProfileColumns } from './prompt-profile-table-columns'
import { useTableQsSort } from '@/hooks/use-table-qs-sort'
import type { PromptProfileRowDto } from '@/modules/prompt-profiles/dto'

interface PromptProfileTableProps {
  data: PromptProfileRowDto[]
  total: number
  pageSize: number
}

export function PromptProfileTable({
  data,
  total,
  pageSize
}: PromptProfileTableProps) {
  const { sorting, onSortingChange } = useTableQsSort()

  return (
    <DataTable
      columns={promptProfileColumns as ColumnDef<PromptProfileRowDto>[]}
      data={data}
      manualSorting
      state={{ sorting }}
      onSortingChange={onSortingChange}
      toolbar={
        <TableActionSection>
          <PromptProfileSearch />
        </TableActionSection>
      }
      footer={<TableQsPagination pageSize={pageSize} total={total} />}
    />
  )
}
