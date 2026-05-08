'use client'

import type { KnowledgeRow } from '@/data-access/knowledge'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
import { TableQsPagination } from '../table/table-qs-pagination'
import KnowledgeCard from './knowledge-card'
import KnowledgeSearch from './knowledge-search'

interface KnowledgeGridProps {
  data: KnowledgeRow[]
  total: number
  pageSize: number
}

export default function KnowledgeGrid({
  data,
  total,
  pageSize
}: KnowledgeGridProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <TableActionSection className='justify-between'>
        <KnowledgeSearch />
      </TableActionSection>
      {data.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4'>
          {data.map(knowledge => (
            <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
          ))}
        </div>
      ) : (
        <div className='text-muted-foreground flex min-h-64 flex-1 items-center justify-center rounded-xl text-sm'>
          没有数据
        </div>
      )}
      <TableFooterSection className='mt-4 justify-end px-0'>
        <TableQsPagination pageSize={pageSize} total={total} />
      </TableFooterSection>
    </div>
  )
}
