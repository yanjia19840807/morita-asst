'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { useTransition } from 'react'
import { userColumns } from './user-table-columns'
import type { AuthUserDto } from '@/modules/auth/dto'
import { DataTable } from '../table/data-table'
import { TableQsPagination } from '../table/table-qs-pagination'
import TableActionSection from '../table/table-action-section'
import UserSearch from './user-search'
import TableSelectionText from '../table/table-selection-text'
import TableBulkAction from '../table/table-bulk-action'
import { Button } from '../ui/button'
import {
  bulkBanUsersAction,
  bulkRemoveUsersAction,
  bulkUnbanUsersAction
} from '@/modules/auth/actions'
import { toast } from 'sonner'
import ConfirmDialog from '../confirm-dialog'
import { useTableSelection } from '@/hooks/use-table-selection'
import { useTableQsSort } from '@/hooks/use-table-qs-sort'

interface UserTableProps {
  data: AuthUserDto[]
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
  } = useTableSelection(data.map(item => item.id))
  const [isPending, startTransition] = useTransition()
  const { sorting, onSortingChange } = useTableQsSort()

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

  return (
    <DataTable
      columns={userColumns as ColumnDef<AuthUserDto>[]}
      data={data}
      manualSorting
      enableRowSelection={isBulkMode}
      getRowId={row => row.id}
      state={{
        sorting,
        rowSelection,
        columnVisibility: { select: isBulkMode }
      }}
      onSortingChange={onSortingChange}
      onRowSelectionChange={onRowSelectionChange}
      toolbar={
        <TableActionSection className='w-full justify-between'>
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
      }
      footer={<TableQsPagination pageSize={pageSize} total={total} />}
    />
  )
}
