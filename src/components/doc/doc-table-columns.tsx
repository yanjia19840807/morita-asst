'use client'

import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'
import { TableColumnHeader } from '../table/table-column-header'
import { DocRowActions } from './doc-row-actions'
import { Checkbox } from '../ui/checkbox'
import type { DocRow } from '@/data-access/doc'

function getDocStatusLabel(row: DocRow) {
  const statuses = row.knowledgeDocuments.map(item => item.status)

  if (statuses.length === 0) {
    return '未加入知识库'
  }

  if (statuses.includes('FAILED')) {
    return '索引失败'
  }

  if (statuses.includes('EMBEDDING')) {
    return '嵌入中'
  }

  if (statuses.includes('SPLITTING')) {
    return '切分中'
  }

  if (statuses.every(status => status === 'READY')) {
    return '已就绪'
  }

  if (statuses.includes('SPLITTED')) {
    return '待嵌入'
  }

  return '待处理'
}

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
    accessorKey: 'status',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'索引状态'} />
    ),
    cell: ({ row }) => getDocStatusLabel(row.original)
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
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('zh-CN')
  },
  {
    id: 'actions',
    cell: ({ row }) => <DocRowActions row={row} />
  }
]
