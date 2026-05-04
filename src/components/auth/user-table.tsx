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
import { userColumns } from './user-table-columns'
import type { UserRow } from '@/data-access/auth'
import TableFooterSection from '../table/table-footer-section'
import { TablePagination } from '../table/table-pagination'
import TableActionSection from '../table/table-action-section'
import UserSearch from './user-search'
import TableSelectionText from '../table/table-selection-text'
import TableBulkAction from '../table/table-bulk-action'
import { Button } from '../ui/button'
import {
  bulkBanUsersAction,
  bulkRemoveUsersAction,
  bulkUnbanUsersAction
} from '@/app/(auth)/actions'
import { toast } from 'sonner'
import ConfirmDialog from '../confirm-dialog'
import { useTableSelection } from '@/hooks/use-table-selection'
import { useTableSort } from '@/hooks/use-table-sort'

interface UserTableProps {
  data: UserRow[]
  total: number
  pageSize: number
}

export function UserTable({ data, total, pageSize }: UserTableProps) {
  const {
    isBulkMode,
    setIsBulkMode,
    selectedIds,
    handleToggle,
    rowSelection,
    clearSelection,
    onRowSelectionChange
  } = useTableSelection(data)
  const [isPending, startTransition] = useTransition()
  const { sorting, onSortingChange } = useTableSort()

  const handleBulkRemove = () => {
    startTransition(async () => {
      try {
        const result = await bulkRemoveUsersAction(selectedIds)
        if (result.success) {
          toast.success(`已删除 ${selectedIds.length} 个用户`)
          clearSelection()
          setIsBulkMode(false)
        } else {
          toast.error(result.error.message)
        }
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleBulkBan = () => {
    startTransition(async () => {
      try {
        const result = await bulkBanUsersAction(selectedIds)
        if (result.success) {
          toast.success(`已禁用 ${selectedIds.length} 个用户`)
          clearSelection()
          setIsBulkMode(false)
        } else {
          toast.error(result.error.message)
        }
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleBulkUnban = () => {
    startTransition(async () => {
      try {
        const result = await bulkUnbanUsersAction(selectedIds)
        if (result.success) {
          toast.success(`已启用 ${selectedIds.length} 个用户`)
          clearSelection()
          setIsBulkMode(false)
        } else {
          toast.error(result.error.message)
        }
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const table = useReactTable({
    data,
    columns: userColumns as ColumnDef<UserRow>[],
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    enableRowSelection: isBulkMode,
    getRowId: row => row.id,
    state: {
      sorting,
      rowSelection,
      columnVisibility: { select: isBulkMode }
    },
    onSortingChange,
    onRowSelectionChange
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col px-2'>
      <TableActionSection className='justify-between'>
        <UserSearch />
        <TableBulkAction isBulkMode={isBulkMode} handleToggle={handleToggle}>
          {isBulkMode && selectedIds.length > 0 && (
            <>
              <TableSelectionText count={selectedIds.length} />
              <ConfirmDialog
                title='确认批量删除'
                description={`即将删除 ${selectedIds.length}
                        个用户，此操作不可撤销，是否继续？`}
                actions={{
                  label: '确认删除',
                  onClick: handleBulkRemove
                }}
              >
                <Button variant='destructive'>批量删除</Button>
              </ConfirmDialog>
              <ConfirmDialog
                title='批量禁用'
                description={`即将禁用 ${selectedIds.length} 个用户，是否继续？`}
                actions={{
                  label: '确认禁用',
                  onClick: handleBulkBan
                }}
              >
                <Button variant='destructive' disabled={isPending}>
                  批量禁用
                </Button>
              </ConfirmDialog>
              <ConfirmDialog
                title='批量启用'
                description={`即将启用 ${selectedIds.length} 个用户，是否继续？`}
                actions={{
                  label: '确认启用',
                  onClick: handleBulkUnban
                }}
              >
                <Button variant='secondary' disabled={isPending}>
                  批量启用
                </Button>
              </ConfirmDialog>
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
                colSpan={userColumns.length}
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
