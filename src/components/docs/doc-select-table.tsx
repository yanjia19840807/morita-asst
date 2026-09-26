'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchSelectDocs,
  getDocsQueryKey,
  initialDocsParams
} from '@/modules/docs/client'
import type { FetchSelectDocsResult } from '@/modules/docs/dto'
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState
} from '@tanstack/react-table'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { DataTable } from '../table/data-table'
import { TableColumnHeader } from '../table/table-column-header'
import TablePagination from '../table/table-pagination'
import { getErrorMessage } from '@/lib/utils'

type SelectableDoc = FetchSelectDocsResult['docs'][number]

const docSelectColumns: ColumnDef<SelectableDoc>[] = [
  {
    id: 'select',
    size: 32,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={checked => table.toggleAllPageRowsSelected(!!checked)}
        aria-label='选择当前页全部文档'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={checked => row.toggleSelected(!!checked)}
        aria-label={`选择文档 ${row.original.filename}`}
      />
    )
  },
  {
    accessorKey: 'filename',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='文档名称' />
    ),
    cell: ({ row }) => row.original.filename
  },
  {
    accessorKey: 'fileSize',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='数据大小' />
    ),
    cell: ({ row }) => row.original.fileSize ?? '-'
  },
  {
    accessorKey: 'mimeType',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='文件类型' />
    ),
    cell: ({ row }) => row.original.mimeType ?? '-'
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
  }
]

interface DocSelectTableProps {
  categoryId?: string
  pageSize: number
  selectedDocIds: string[]
  onSelectedDocIdsChange: (ids: string[]) => void
  disabled?: boolean
}

export function DocSelectTable({
  categoryId,
  pageSize,
  selectedDocIds,
  onSelectedDocIdsChange,
  disabled = false
}: DocSelectTableProps) {
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(initialDocsParams.page)
  const [sortBy, setSortBy] = useState<
    'filename' | 'fileSize' | 'mimeType' | 'createdAt'
  >(initialDocsParams.sortBy)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialDocsParams.sortDirection
  )

  const docsParams = {
    searchField: 'filename' as const,
    searchValue: searchText || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortDirection,
    page,
    pageSize
  }

  const docsQuery = useQuery({
    queryKey: getDocsQueryKey(docsParams),
    queryFn: () => fetchSelectDocs(docsParams),
    placeholderData: previousData => previousData
  })

  const data = docsQuery.data?.docs ?? []
  const total = docsQuery.data?.total ?? 0
  const isLoading = docsQuery.isFetching && !docsQuery.data
  const error = docsQuery.error ? getErrorMessage(docsQuery.error) : null

  const selectedIds = selectedDocIds ?? []

  const rowSelection = data.reduce<RowSelectionState>((accumulator, doc) => {
    if (selectedIds.includes(doc.id)) {
      accumulator[doc.id] = true
    }

    return accumulator
  }, {})

  const sorting: SortingState = [
    {
      id: sortBy,
      desc: sortDirection === 'desc'
    }
  ]

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const nextRowSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    const currentPageIds = new Set(data.map(doc => doc.id))
    const preservedIds = selectedIds.filter(id => !currentPageIds.has(id))
    const nextPageSelectedIds = data
      .filter(doc => nextRowSelection[doc.id])
      .map(doc => doc.id)

    onSelectedDocIdsChange([...preservedIds, ...nextPageSelectedIds])
  }

  const handleSortingChange: OnChangeFn<SortingState> = updater => {
    const nextSorting =
      typeof updater === 'function' ? updater(sorting) : updater

    if (nextSorting.length === 0) {
      setSortBy('createdAt')
      setSortDirection('desc')
      setPage(1)
      return
    }

    const nextSort = nextSorting[0]

    setSortBy(nextSort.id as 'filename' | 'fileSize' | 'mimeType' | 'createdAt')
    setSortDirection(nextSort.desc ? 'desc' : 'asc')
    setPage(1)
  }

  return (
    <DataTable
      columns={docSelectColumns}
      data={data}
      getRowId={row => row.id}
      enableRowSelection={!disabled}
      state={{
        rowSelection,
        sorting,
        columnVisibility: { select: !disabled }
      }}
      onRowSelectionChange={handleRowSelectionChange}
      onSortingChange={handleSortingChange}
      empty={isLoading ? '加载中...' : error ? error : '没有数据'}
      toolbar={
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
          disabled={disabled}
          className='max-w-sm'
        />
      }
      footer={
        <TablePagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          total={total}
        />
      }
    />
  )
}
