'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import type { KnowledgeChunkListItemDto } from '@/modules/knowledges'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
import { knowledgeChunkColumns } from './knowledge-chunk-table-columns'
import TablePagination from '../table/table-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'
import { useChunkParams } from '@/hooks/use-chunk-params'

function KnowledgeChunkTable({
  chunks,
  total,
  pageSize
}: {
  chunks: KnowledgeChunkListItemDto[]
  total: number
  pageSize: number
}) {
  const {
    page,
    setPage,
    searchValue,
    setSearchValue,
    sorting,
    onSortingChange
  } = useChunkParams()

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: chunks,
    columns: knowledgeChunkColumns as ColumnDef<KnowledgeChunkListItemDto>[],
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    getRowId: row => row.id,
    state: {
      sorting
    },
    onSortingChange
  })

  return (
    <div>
      <TableActionSection className='justify-between'>
        <Input
          value={searchValue}
          onKeyDown={event =>
            event.key === 'Enter' && event.currentTarget.blur()
          }
          onChange={event => setSearchValue(event.target.value || null)}
          placeholder='搜索 content / metadata / 文档名'
          className='w-1/2'
        />
      </TableActionSection>
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
          {table.getRowModel().rows.length > 0 ? (
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
                colSpan={knowledgeChunkColumns.length}
                className='h-24 text-center'
              >
                当前没有可浏览的 Chunk
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TableFooterSection className='justify-between'>
        <div className='text-muted-foreground text-sm'>共 {total} 条 Chunk</div>
        <div>
          <TablePagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={total}
          />
        </div>
      </TableFooterSection>
    </div>
  )
}

export default KnowledgeChunkTable
