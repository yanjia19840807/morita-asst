'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchSelectDocs,
  getDocsQueryKey,
  initialDocsParams
} from '@/lib/api/client/doc'
import type { FetchSelectDocsResult } from '@/lib/api/shared/doc'
import { getErrorMessage } from '@/lib/api/shared/response'
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { SidebarInset } from '../ui/sidebar'
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

type SelectableDocument = FetchSelectDocsResult['documents'][number]

const docSelectColumns: ColumnDef<SelectableDocument>[] = [
  {
    id: 'select',
    enableSorting: false,
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
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('zh-CN')
  }
]

interface DocSelectTableProps {
  categoryId?: string
  pageSize: number
  selectedDocumentIds: string[]
  onSelectedDocumentIdsChange: (ids: string[]) => void
  disabled?: boolean
}

export function DocSelectTable({
  categoryId,
  pageSize,
  selectedDocumentIds,
  onSelectedDocumentIdsChange,
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
    filename: searchText || undefined,
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

  const data = docsQuery.data?.documents ?? []
  const total = docsQuery.data?.total ?? 0
  const isLoading = docsQuery.isFetching && !docsQuery.data
  const error = docsQuery.error ? getErrorMessage(docsQuery.error) : null

  const selectedIds = selectedDocumentIds ?? []

  const rowSelection = data.reduce<RowSelectionState>(
    (accumulator, document) => {
      if (selectedIds.includes(document.id)) {
        accumulator[document.id] = true
      }

      return accumulator
    },
    {}
  )

  const sorting: SortingState = [
    {
      id: sortBy,
      desc: sortDirection === 'desc'
    }
  ]

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = updater => {
    const nextRowSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    const currentPageIds = new Set(data.map(document => document.id))
    const preservedIds = selectedIds.filter(id => !currentPageIds.has(id))
    const nextPageSelectedIds = data
      .filter(document => nextRowSelection[document.id])
      .map(document => document.id)

    onSelectedDocumentIdsChange([...preservedIds, ...nextPageSelectedIds])
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

  const table = useReactTable({
    data,
    columns: docSelectColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
    enableRowSelection: !disabled,
    state: {
      rowSelection,
      sorting,
      columnVisibility: { select: !disabled }
    },
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange
  })

  return (
    <SidebarInset className='flex h-full min-h-0 flex-1 flex-col gap-3 p-4'>
      <div className='w-1/2'>
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
                colSpan={docSelectColumns.length}
                className='h-24 text-center'
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
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
                colSpan={docSelectColumns.length}
                className='h-24 text-center'
              >
                没有数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        total={total}
      />
    </SidebarInset>
  )
}
