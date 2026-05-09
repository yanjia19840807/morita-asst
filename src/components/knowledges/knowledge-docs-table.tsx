'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchKnowledgeDocsClient } from '@/lib/api/client/knowledge'
import { getErrorMessage } from '@/lib/api/shared/response'
import {
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { FetchKnowledgeDocsParams } from '@/schemas/knowledge'
import type { FetchKnowledgeDocsListResult } from '@/lib/api/shared/knowledge'
import { Input } from '../ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import { TableColumnHeader } from '../table/table-column-header'
import TablePagination from '../table/table-pagination'
import { Badge } from '../ui/badge'
import _ from 'lodash'

type KnowledgeDocItem = FetchKnowledgeDocsListResult['docs'][number]

const statusLabelMap: Record<string, string> = {
  UPLOADED: '已上传',
  SPLITTING: '切分中',
  SPLITTED: '已切分',
  EMBEDDING: '嵌入中',
  READY: '已就绪',
  FAILED: '失败'
}

const knowledgeDocColumns: ColumnDef<KnowledgeDocItem>[] = [
  {
    accessorKey: 'doc.filename',
    id: 'filename',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='文档名称' />
    ),
    cell: ({ row }) => row.original.doc.filename
  },
  {
    accessorKey: 'doc.docCate.name',
    id: 'category',
    header: () => <div>所属类目</div>,
    cell: ({ row }) => row.original.doc.docCate?.name ?? '未分类'
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <TableColumnHeader column={column} title='状态' />,
    cell: ({ row }) => (
      <Badge variant='outline'>
        {statusLabelMap[row.original.status] ?? row.original.status}
      </Badge>
    )
  },
  {
    accessorKey: 'chunkCount',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='Chunk 数' />
    ),
    cell: ({ row }) => row.original.chunkCount
  },
  {
    accessorKey: 'lastIndexedAt',
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
    header: ({ column }) => (
      <TableColumnHeader column={column} title='关联时间' />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
  }
]

interface KnowledgeDocsTableProps {
  knowledgeId: string
}

export function KnowledgeDocsTable({ knowledgeId }: KnowledgeDocsTableProps) {
  const [searchText, setSearchText] = useState<string | undefined>()
  const [page, setPage] = useState<number | undefined>()
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortDirection, setSortDirection] = useState<
    'asc' | 'desc' | undefined
  >(undefined)

  const knowledgeDocsParams: FetchKnowledgeDocsParams = {
    knowledgeId,
    ...(_.isNil(searchText) ? {} : { searchText }),
    ...(_.isNil(page) ? {} : { page }),
    ...(_.isNil(sortBy) ? {} : { sortBy }),
    ...(_.isNil(sortDirection) ? {} : { sortDirection })
  }

  const knowledgeDocsQuery = useQuery({
    queryKey: ['knowledge-docs', knowledgeDocsParams],
    queryFn: () => fetchKnowledgeDocsClient(knowledgeDocsParams),
    placeholderData: previousData => previousData
  })

  const data = knowledgeDocsQuery.data?.docs ?? []
  const total = knowledgeDocsQuery.data?.total ?? 0
  const isLoading = knowledgeDocsQuery.isLoading
  const error = knowledgeDocsQuery.error
    ? getErrorMessage(knowledgeDocsQuery.error)
    : null

  const sorting: SortingState = sortBy
    ? [
        {
          id: sortBy,
          desc: sortDirection === 'desc'
        }
      ]
    : []

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    const nextSorting =
      typeof updater === 'function' ? updater(sorting) : updater

    if (nextSorting.length === 0) {
      setPage(1)
      return
    }

    const nextSort = nextSorting[0]
    if (nextSort) {
      setSortBy(nextSort.id)
      setSortDirection(nextSort.desc ? 'desc' : 'asc')
      setPage(1)
    }
  }

  const table = useReactTable({
    data,
    columns: knowledgeDocColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
    state: { sorting },
    onSortingChange
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <div className='w-full max-w-sm'>
        <Input
          onKeyDown={event =>
            event.key === 'Enter' && event.currentTarget.blur()
          }
          value={searchText}
          onChange={event => {
            setSearchText(event.target.value)
            setPage(1)
          }}
          placeholder='搜索文档名称'
        />
      </div>
      {error && <div className='text-destructive text-sm'>{error}</div>}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
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
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={knowledgeDocColumns.length}
                className='h-24 text-center'
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={knowledgeDocColumns.length}
                className='h-24 text-center'
              >
                暂无关联文档
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        setPage={setPage}
        pageSize={10}
        total={total}
        className='justify-end'
      />
    </div>
  )
}
