'use client'

import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { TableColumnHeader } from '../table/table-column-header'
import type { KnowledgeChunkListItemDto } from '@/modules/knowledges'
import PreviewCell from '../preview-cell'

export const knowledgeChunkColumns: ColumnDef<KnowledgeChunkListItemDto>[] = [
  {
    accessorKey: 'filename',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='来源文档' className='w-full' />
    ),
    cell: ({ row }) => (
      <Link
        href={`/docs/${row.original.docId}`}
        className='text-primary line-clamp-2 block min-w-0 underline'
      >
        {row.original.filename}
      </Link>
    ),
    size: 180
  },
  {
    accessorKey: 'content',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='Content' className='w-full' />
    ),
    cell: ({ row }) => <PreviewCell value={row.original.content} />,
    size: 320
  },
  {
    accessorKey: 'metadata',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='Metadata' className='w-full' />
    ),
    cell: ({ row }) => <PreviewCell value={row.original.metadata} />,
    size: 220
  },
  {
    accessorKey: 'vector',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='Vector' className='w-full' />
    ),
    cell: ({ row }) => <PreviewCell value={row.original.vector} />,
    size: 220
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm'),
    size: 144
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='更新时间' />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.updatedAt), 'yyyy-MM-dd HH:mm'),
    size: 144
  }
]
