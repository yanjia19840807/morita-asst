'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { PromptProfileRow } from '@/data-access/prompt-profile'
import { TableColumnHeader } from '../table/table-column-header'

function getPromptProfileSummary(systemPrompt: string) {
  const normalized = systemPrompt.replace(/\s+/g, ' ').trim()

  return normalized.length > 120
    ? `${normalized.slice(0, 120)}...`
    : normalized || '未填写'
}

export const promptProfileColumns: ColumnDef<PromptProfileRow>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <TableColumnHeader column={column} title='名称' />,
    cell: ({ row }) => (
      <div className='max-w-64 font-medium wrap-break-word'>
        {row.original.name}
      </div>
    )
  },
  {
    accessorKey: 'systemPrompt',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title='内容摘要' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground max-w-xl wrap-break-word'>
        {getPromptProfileSummary(row.original.systemPrompt)}
      </div>
    )
  },
  {
    id: 'agentCount',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='关联助手数' />
    ),
    cell: ({ row }) => row.original._count.agents
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='更新时间' />
    ),
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString('zh-CN')
  }
]
