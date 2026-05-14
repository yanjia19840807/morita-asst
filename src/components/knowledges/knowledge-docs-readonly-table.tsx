'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  queryKnowledgeDocs,
  getKnowledgeDocsQueryKey
} from '@/modules/knowledges/client'
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { FetchKnowledgeDocsParams } from '@/modules/knowledges/schemas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'

import TablePagination from '../table/table-pagination'
import _ from 'lodash'
import { getErrorMessage } from '@/lib/utils'
import { knowledgeDocsReadonlyColumns } from './knowledge-docs-readonly-columns'

const processingStatuses = new Set(['LOADING', 'SPLITTING', 'EMBEDDING'])

export function KnowledgeDocsReadonlyTable({
  knowledgeId
}: {
  knowledgeId: string
}) {
  const [page, setPage] = useState<number | undefined>()

  const knowledgeDocsParams: FetchKnowledgeDocsParams = {
    knowledgeId,
    ...(_.isNil(page) ? {} : { page })
  }
  const knowledgeDocsQuery = useQuery({
    queryKey: getKnowledgeDocsQueryKey(knowledgeDocsParams),
    queryFn: () => queryKnowledgeDocs(knowledgeDocsParams),
    placeholderData: previousData => previousData,
    refetchInterval: query => {
      const docs = query.state.data?.docs ?? []
      return docs.some(doc => processingStatuses.has(doc.status)) ? 3000 : false
    }
  })

  const data = knowledgeDocsQuery.data?.docs ?? []
  const total = knowledgeDocsQuery.data?.total ?? 0
  const isLoading = knowledgeDocsQuery.isLoading
  const error = knowledgeDocsQuery.error
    ? getErrorMessage(knowledgeDocsQuery.error)
    : null

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: knowledgeDocsReadonlyColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id,
    state: {}
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
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
                colSpan={knowledgeDocsReadonlyColumns.length}
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
                colSpan={knowledgeDocsReadonlyColumns.length}
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
