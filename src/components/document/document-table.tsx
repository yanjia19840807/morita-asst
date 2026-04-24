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
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { useTransition } from 'react'
import { documentColumns } from './document-table-columns'
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
import DocumentSearch from './document-search'
import { useTableSelection } from '@/hooks/use-table-selection'
import { DocumentModel } from '@/generated/prisma/models'

interface DocumentTableProps {
  data: DocumentModel[]
  total: number
  pageSize: number
}

export function DocumentTable({ data, total, pageSize }: DocumentTableProps) {
  const {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    setSelectedIds,
    rowSelection,
    onRowSelectionChange
  } = useTableSelection(data)

  const [isPending, startTransition] = useTransition()
  const [{ sortBy, sortDirection }, setSortParams] = useQueryStates(
    {
      sortBy: parseAsString,
      sortDirection: parseAsStringEnum(['asc', 'desc'])
    },
    { shallow: false, startTransition, history: 'push' }
  )

  const sorting: SortingState = sortBy
    ? [{ id: sortBy, desc: sortDirection === 'desc' }]
    : []

  const handleToggle = () => {
    if (isBulkMode) setSelectedIds(new Set())
    setIsBulkMode(v => !v)
  }

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    if (newSorting.length > 0) {
      setSortParams({
        sortBy: newSorting[0].id,
        sortDirection: newSorting[0].desc ? 'desc' : 'asc'
      })
    } else {
      setSortParams({ sortBy: null, sortDirection: null })
    }
  }

  const handleBulkRemove = () => {
    startTransition(async () => {
      try {
        setSelectedIds(new Set())
        setIsBulkMode(false)
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const table = useReactTable({
    data,
    columns: documentColumns as ColumnDef<DocumentModel>[],
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
    <div>
      <TableActionSection className='justify-between'>
        <div>
          <DocumentSearch />
        </div>
        <div>
          <TableBulkAction isBulkMode={isBulkMode} handleToggle={handleToggle}>
            {isBulkMode && selectedIds.size > 0 && (
              <>
                <TableSelectionText count={selectedIds.size} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>批量删除</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        即将删除 {selectedIds.size}{' '}
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
                colSpan={documentColumns.length}
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
