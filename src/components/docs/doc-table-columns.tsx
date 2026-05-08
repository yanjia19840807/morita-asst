'use client'

import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'
import { TableColumnHeader } from '../table/table-column-header'
import { DocRowActions } from './doc-row-actions'
import { Checkbox } from '../ui/checkbox'
import type { DocRow } from '@/dal/docs'

export const docColumns: ColumnDef<DocRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={checked => table.toggleAllPageRowsSelected(!!checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={checked => row.toggleSelected(!!checked)}
      />
    )
  },
  {
    accessorKey: 'filename',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='文档名称' />
    ),
    cell: ({ row }) => (
      <Link
        href={`/documents/${row.original.id}`}
        className='text-primary font-medium underline'
      >
        {row.original.filename}
      </Link>
    )
  },
  {
    accessorKey: 'fileSize',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'数据大小'} />
    )
  },
  {
    id: 'knowledgeCount',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'知识库数'} />
    ),
    cell: ({ row }) => row.original._count.knowledgeDocuments
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'创建时间'} />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
  },
  {
    id: 'actions',
    cell: ({ row }) => <DocRowActions row={row} />
  }
]
