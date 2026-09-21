'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from '../ui/table'
import { getDocCateColumns } from './doc-cate-table-columns'
import { reorderDocCatesAction } from '@/modules/docs/actions'
import { DragDropProvider } from '@dnd-kit/react'
import { useMemo, useState, useTransition } from 'react'
import type { DragEndEvent } from '@dnd-kit/abstract'
import DraggableRow from '../draggable-row'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { editDocCateAction } from '@/modules/docs/actions'
import { docCateCreateFormSchema } from '@/modules/docs/schemas'
import type { DocCateRow } from '@/modules/docs/service'

interface DocCateTableProps {
  data: DocCateRow[]
}

function DocCateTable({ data }: DocCateTableProps) {
  const [isPending, startTransition] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const router = useRouter()

  const handleStartEdit = (category: DocCateRow) => {
    setEditingId(category.id)
    setNameDraft(category.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNameDraft('')
  }

  const handleSaveEdit = () => {
    if (!editingId) {
      return
    }

    const validation = docCateCreateFormSchema.safeParse({ name: nameDraft })
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? '类目名称无效')
      return
    }

    startSaving(async () => {
      try {
        const result = await editDocCateAction({
          id: editingId,
          name: validation.data.name
        })

        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        toast.success('类目名称已更新')
        handleCancelEdit()
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  function handleDragEnd({ operation, canceled }: DragEndEvent) {
    if (canceled || isPending || editingId) {
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

  const columns = useMemo(
    () =>
      getDocCateColumns({
        editingId,
        nameDraft,
        isSaving,
        onNameDraftChange: setNameDraft,
        onStartEdit: handleStartEdit,
        onCancelEdit: handleCancelEdit,
        onSaveEdit: handleSaveEdit
      }),
    [editingId, nameDraft, isSaving]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id
  })

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className='flex min-h-0 flex-1 flex-col'>
        <Table className='table-fixed'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <DraggableRow
                  key={row.id}
                  rowId={row.id}
                  index={index}
                  disabled={row.original.isDefault || isPending || Boolean(editingId)}
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  还没有类目
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
