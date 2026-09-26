'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import type { KnowledgeChunkListItemDto } from '@/modules/knowledges'
import TableActionSection from '../table/table-action-section'
import { DataTable } from '../table/data-table'
import { knowledgeChunkColumns } from './knowledge-chunk-table-columns'
import TablePagination from '../table/table-pagination'
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

  return (
    <DataTable
      columns={knowledgeChunkColumns as ColumnDef<KnowledgeChunkListItemDto>[]}
      data={chunks}
      manualSorting
      getRowId={row => row.id}
      state={{ sorting }}
      onSortingChange={onSortingChange}
      tableClassName='table-fixed'
      cellClassName='align-top whitespace-normal'
      empty='当前没有可浏览的 Chunk'
      toolbar={
        <TableActionSection className='w-full'>
          <Input
            value={searchValue}
            onKeyDown={event =>
              event.key === 'Enter' && event.currentTarget.blur()
            }
            onChange={event => setSearchValue(event.target.value || null)}
            placeholder='搜索 content / metadata / 文档名'
            className='max-w-sm'
          />
        </TableActionSection>
      }
      footerClassName='flex items-center justify-between gap-4'
      footer={
        <>
          <div className='text-muted-foreground text-sm'>共 {total} 条 Chunk</div>
          <TablePagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={total}
            className='mx-0 w-auto'
          />
        </>
      }
    />
  )
}

export default KnowledgeChunkTable
