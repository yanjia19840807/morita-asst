'use client'

import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../table/table-column-header'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import RowDragHandle from '../row-drag-handle'
import { DocCateRowActions } from './doc-cate-row-actions'
import type { DocCateRow } from '@/modules/docs/service'

export function getDocCateColumns({
  editingId,
  nameDraft,
  isSaving,
  onNameDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: {
  editingId: string | null
  nameDraft: string
  isSaving: boolean
  onNameDraftChange: (value: string) => void
  onStartEdit: (category: DocCateRow) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
}): ColumnDef<DocCateRow>[] {
  return [
    {
      id: 'sort',
      size: 72,
      header: '排序',
      cell: ({ row }) => <RowDragHandle disabled={row.original.isDefault} />
    },
    {
      accessorKey: 'name',
      enableSorting: false,
      header: ({ column }) => <TableColumnHeader column={column} title='名称' />,
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <Input
            value={nameDraft}
            onChange={event => onNameDraftChange(event.target.value)}
            placeholder='填写类目名称'
            autoFocus
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSaveEdit()
              }
              if (event.key === 'Escape') {
                onCancelEdit()
              }
            }}
          />
        ) : (
          <div className='flex items-center gap-2'>
            <span>{row.original.name}</span>
            {row.original.isDefault ? (
              <Badge variant='secondary'>默认</Badge>
            ) : null}
          </div>
        )
    },
    {
      id: 'docCount',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='文档数' />
      ),
      cell: ({ row }) => row.original._count.docs
    },
    {
      accessorKey: 'createdAt',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='创建时间' />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>操作</div>,
      cell: ({ row }) => (
        <DocCateRowActions
          category={row.original}
          isEditing={editingId === row.original.id}
          isSaving={isSaving}
          onEdit={() => onStartEdit(row.original)}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      )
    }
  ]
}
