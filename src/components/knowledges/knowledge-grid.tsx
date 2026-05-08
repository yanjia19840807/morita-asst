'use client'

import type { KnowLedgesWithTotal } from '@/dal/knowledges'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
import { TableQsPagination } from '../table/table-qs-pagination'
import KnowledgeCard from './knowledge-card'
import KnowledgeSearch from './knowledge-search'

interface KnowledgeGridProps {
  data: KnowLedgesWithTotal
  pageSize: number
}

export default function KnowledgeGrid({ data, pageSize }: KnowledgeGridProps) {
  const { knowledges, total } = data

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <TableActionSection className='justify-between'>
        <KnowledgeSearch />
      </TableActionSection>
      {knowledges.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4'>
          {knowledges.map(knowledge => (
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
