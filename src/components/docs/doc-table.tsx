'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { useTransition } from 'react'
import { docColumns } from './doc-table-columns'
import { DataTable } from '../table/data-table'
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
import { deleteDocsAction } from '@/modules/docs/actions'
import type { DocRowDto } from '@/modules/docs/dto'

interface DocTableProps {
  data: DocRowDto[]
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
  } = useTableSelection(data.map(item => item.id))
  const { sorting, onSortingChange } = useTableQsSort()

  const [, startTransition] = useTransition()

  const handleBulkRemove = () => {
    startTransition(async () => {
      try {
        const result = await deleteDocsAction(selectedIds)
        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        clearSelection()
        setIsBulkMode(false)
      } catch {
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  return (
    <DataTable
      columns={docColumns as ColumnDef<DocRowDto>[]}
      data={data}
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
          <DocSearch />
          <TableBulkAction isBulkMode={isBulkMode} handleToggle={handleToggle}>
            {isBulkMode && selectedIds.length > 0 && (
              <>
                <TableSelectionText count={selectedIds.length} />
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant='destructive' />}>
                    批量删除
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认批量删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        即将删除 {selectedIds.length}
                        个文档，此操作不可撤销，是否继续？
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
      }
      footer={<TableQsPagination pageSize={pageSize} total={total} />}
    />
  )
}
