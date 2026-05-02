'use client'

import {
  ColumnDef,
  OnChangeFn,
  SortingState,
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
import { TablePagination } from '../table/table-pagination'
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
import { DocumentModel } from '@/generated/prisma/models'
import { useDocumentsParams } from '@/hooks/use-documents-params'

interface DocTableProps {
  data: DocumentModel[]
  total: number
  pageSize: number
}

export function DocTable({ data, total, pageSize }: DocTableProps) {
  const {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    setSelectedIds,
    rowSelection,
    onRowSelectionChange
  } = useTableSelection(data)
  const { sortBy, sortDirection, setSorting } = useDocumentsParams()

  const [, startTransition] = useTransition()

  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortDirection === 'desc' }]
    : []

  const handleToggle = () => {
    if (isBulkMode) setSelectedIds([])
    setIsBulkMode(v => !v)
  }

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    if (newSorting.length > 0) {
      setSorting(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc')
    } else {
      setSorting(null, null)
    }
  }

  const handleBulkRemove = () => {
    startTransition(async () => {
      try {
        setSelectedIds([])
        setIsBulkMode(false)
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const table = useReactTable({
    data,
    columns: docColumns as ColumnDef<DocumentModel>[],
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
    <div className='px-2'>
      <TableActionSection className='justify-between'>
        <div>
          <DocSearch />
        </div>
        <div>
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
        </div>
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
          <TablePagination pageSize={pageSize} total={total} />
        </div>
      </TableFooterSection>
    </div>
  )
}
