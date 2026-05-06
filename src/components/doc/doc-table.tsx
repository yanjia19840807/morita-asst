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
import { useTransition } from 'react'
import { docColumns } from './doc-table-columns'
import TableFooterSection from '../table/table-footer-section'
import { TableQsPagination } from '../table/table-qs-pagination'
import TableActionSection from '../table/table-action-section'
import TableSelectionText from '../table/table-selection-text'
import TableBulkAction from '../table/table-bulk-action'
import { Button } from '../ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog'
import { toast } from 'sonner'
import DocSearch from './doc-search'
import { useTableSelection } from '@/hooks/use-table-selection'
import { useTableQsSort } from '@/hooks/use-table-qs-sort'
import type { DocRow } from '@/data-access/doc'

interface DocTableProps {
  data: DocRow[]
  total: number
  pageSize: number
}

export function DocTable({ data, total, pageSize }: DocTableProps) {
  const {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    rowSelection,
    onRowSelectionChange,
    clearSelection,
    handleToggle
  } = useTableSelection(data)
  const { sorting, onSortingChange } = useTableQsSort()

  const [, startTransition] = useTransition()

  const handleBulkRemove = () => {
    startTransition(async () => {
      try {
        clearSelection()
        setIsBulkMode(false)
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const table = useReactTable({
    data,
    columns: docColumns as ColumnDef<DocRow>[],
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: isBulkMode,
    state: {
      sorting,
      rowSelection,
      columnVisibility: { select: isBulkMode }
    },
    onSortingChange,
    onRowSelectionChange
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-2'>
      <TableActionSection className='justify-between'>
        <DocSearch />
        <TableBulkAction isBulkMode={isBulkMode} handleToggle={handleToggle}>
          {isBulkMode && selectedIds.length > 0 && (
            <>
              <TableSelectionText count={selectedIds.length} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive'>批量删除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      即将删除 {selectedIds.length}
                      个用户，此操作不可撤销，是否继续？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkRemove}>
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </TableBulkAction>
      </TableActionSection>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
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
                colSpan={docColumns.length}
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
