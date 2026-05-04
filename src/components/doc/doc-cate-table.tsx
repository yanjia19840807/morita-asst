'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import TableActionSection from '../table/table-action-section'
import TableBulkAction from '../table/table-bulk-action'
import TableSelectionText from '../table/table-selection-text'
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '../ui/table'
import { Button } from '../ui/button'
import { DocumentCategory } from '@/generated/prisma/client'
import { docCateColumns } from './doc-cate-table-columns'
import ConfirmDialog from '../confirm-dialog'
import { useTableSelection } from '@/hooks/use-table-selection'
import { reorderDocCatesAction } from '@/app/(dashboard)/documents/actions'
import { DragDropProvider } from '@dnd-kit/react'
import { useTransition } from 'react'
import type { DragEndEvent } from '@dnd-kit/abstract'
import DraggableRow from '../draggable-row'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DocCateTableProps {
  data: DocumentCategory[]
}

function DocCateTable({ data }: DocCateTableProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    isBulkMode,
    handleToggle,
    rowSelection,
    onRowSelectionChange,
    selectedLength
  } = useTableSelection(data)

  const handleBulkRemove = () => {}

  function handleDragEnd({ operation, canceled }: DragEndEvent) {
    if (canceled || isPending) {
      return
    }

    const sourceId = operation.source?.id?.toString()
    let targetId = operation.target?.id?.toString()
    const sortableSource = operation.source as {
      initialIndex?: number
      index?: number
    } | null

    if (
      sortableSource &&
      typeof sortableSource.initialIndex === 'number' &&
      typeof sortableSource.index === 'number'
    ) {
      const sourceIndex = sortableSource.initialIndex
      const targetIndex = sortableSource.index

      if (
        sourceIndex !== targetIndex &&
        targetIndex >= 0 &&
        targetIndex < data.length
      ) {
        targetId = data[targetIndex]?.id
      }
    }

    if (!sourceId || !targetId || sourceId === targetId) {
      return
    }

    startTransition(async () => {
      try {
        const result = await reorderDocCatesAction({ sourceId, targetId })

        if (result.success) {
          router.refresh()
          toast.success('排序已更新')
        } else {
          toast.error(result.error.message)
        }
      } catch {
        toast.error('排序失败，请稍后重试')
      }
    })
  }

  const table = useReactTable({
    data,
    columns: docCateColumns as ColumnDef<DocumentCategory>[],
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: row => !row.original.isDefault && isBulkMode,
    state: {
      rowSelection,
      columnVisibility: { select: isBulkMode, sort: isBulkMode }
    },
    getRowId: row => row.id,
    onRowSelectionChange
  })

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className='px-2'>
        <TableActionSection className='justify-between'>
          <div></div>
          <TableBulkAction isBulkMode={isBulkMode} handleToggle={handleToggle}>
            {isBulkMode && selectedLength > 0 && (
              <>
                <TableSelectionText count={selectedLength} />
                <ConfirmDialog
                  title='确认批量删除'
                  description={`即将删除 ${selectedLength}
                        个用户，此操作不可撤销，是否继续？`}
                  actions={{
                    label: '确认批量删除',
                    onClick: handleBulkRemove
                  }}
                >
                  <Button variant='destructive'>批量删除</Button>
                </ConfirmDialog>
              </>
            )}
          </TableBulkAction>
        </TableActionSection>
        <Table className='table-fixed'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize()
                      }}
                    >
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
              table.getRowModel().rows.map((row, index) => (
                <DraggableRow
                  key={row.id}
                  rowId={row.id}
                  index={index}
                  disabled={row.original.isDefault || isPending}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize()
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </DraggableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={docCateColumns.length}
                  className='h-24 text-center'
                >
                  没有数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DragDropProvider>
  )
}

export default DocCateTable
