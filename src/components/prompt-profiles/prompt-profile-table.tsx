'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
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

  const table = useReactTable({
    data,
    columns: promptProfileColumns as ColumnDef<PromptProfileRowDto>[],
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting
    },
    onSortingChange
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col px-2'>
      <TableActionSection className='justify-between'>
        <PromptProfileSearch />
        <div></div>
      </TableActionSection>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={promptProfileColumns.length}
                className='h-24 text-center'
              >
                没有数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TableFooterSection className='justify-between'>
        <div></div>
        <div>
          <TableQsPagination pageSize={pageSize} total={total} />
        </div>
      </TableFooterSection>
    </div>
  )
}
