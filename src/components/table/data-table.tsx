'use client'

import {
  type ColumnDef,
  type Row,
  type TableOptions,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  toolbar?: ReactNode
  footer?: ReactNode
  empty?: ReactNode
  tableClassName?: string
  cellClassName?: string
  footerClassName?: string
  renderRow?: (row: Row<TData>, index: number) => ReactNode
} & Omit<Partial<TableOptions<TData>>, 'data' | 'columns'>

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  footer,
  empty = '没有数据',
  tableClassName,
  cellClassName,
  footerClassName,
  renderRow,
  ...options
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...options
  })

  return (
    <div className='w-full min-w-0'>
      {toolbar ? (
        <div className='flex min-w-0 items-center py-4'>{toolbar}</div>
      ) : null}
      <div className='min-w-0 overflow-hidden rounded-md border'>
        <Table className={cn('table-fixed', tableClassName)}>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={
                      header.column.columnDef.size
                        ? {
                            width: header.getSize(),
                            minWidth: header.getSize()
                          }
                        : undefined
                    }
                  >
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) =>
                renderRow ? (
                  renderRow(row, index)
                ) : (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className={cellClassName}
                        style={
                          cell.column.columnDef.size
                            ? {
                                width: cell.column.getSize(),
                                minWidth: cell.column.getSize()
                              }
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {footer ? (
        <div className={cn('py-4', footerClassName)}>{footer}</div>
      ) : null}
    </div>
  )
}

export default DataTable
