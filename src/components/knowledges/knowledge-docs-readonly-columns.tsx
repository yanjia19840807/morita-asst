import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../table/table-column-header'
import { KnowledgeDocsReadonlyRowActions } from './knowledge-docs-readonly-row-actions'
import { KnowledgeDocListItemDto } from '@/modules/knowledges'
import { Badge } from '../ui/badge'
import { format } from 'date-fns'

const statusLabelMap: Record<string, string> = {
  PENDING: '待处理',
  LOADING: '加载中',
  SPLITTING: '切分中',
  EMBEDDING: '嵌入中',
  READY: '已就绪',
  FAILED: '失败'
}

export const knowledgeDocsReadonlyColumns: ColumnDef<KnowledgeDocListItemDto>[] =
  [
    {
      accessorKey: 'filename',
      enableSorting: false,
      id: 'filename',
      header: ({ column }) => (
        <TableColumnHeader column={column} title='文档名称' />
      ),
      cell: ({ row }) => row.original.filename
    },
    {
      accessorKey: 'docCateName',
      enableSorting: false,
      id: 'category',
      header: () => <div>所属类目</div>,
      cell: ({ row }) => row.original.docCateName ?? '未分类'
    },
    {
      accessorKey: 'status',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => (
        <Badge variant='outline'>
          {statusLabelMap[row.original.status] ?? row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'chunkCount',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='Chunk 数' />
      ),
      cell: ({ row }) => row.original.chunkCount || '-'
    },
    {
      accessorKey: 'lastIndexedAt',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='最近索引' />
      ),
      cell: ({ row }) =>
        row.original.lastIndexedAt
          ? format(new Date(row.original.lastIndexedAt), 'yyyy/MM/dd HH:mm')
          : '-'
    },
    {
      accessorKey: 'createdAt',
      enableSorting: false,
      header: ({ column }) => (
        <TableColumnHeader column={column} title='关联时间' />
      ),
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => <div className='text-right'>操作</div>,
      cell: ({ row }) => <KnowledgeDocsReadonlyRowActions item={row.original} />
    }
  ]
