'use client'

import type { KnowledgesWithTotalDto } from '@/modules/knowledges/dto'
import { ListStack } from '@/components/layout/list-stack'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
import { TableQsPagination } from '../table/table-qs-pagination'
import KnowledgeCard from './knowledge-card'
import KnowledgeSearch from './knowledge-search'

interface KnowledgeGridProps {
  data: KnowledgesWithTotalDto
  pageSize: number
}

export default function KnowledgeGrid({ data, pageSize }: KnowledgeGridProps) {
  const { knowledges, total } = data

  return (
    <ListStack>
      <TableActionSection>
        <KnowledgeSearch />
      </TableActionSection>
      {knowledges.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4'>
          {knowledges.map(knowledge => (
            <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
          ))}
        </div>
      ) : (
        <div className='bg-card shadow-md ring-border text-muted-foreground flex min-h-64 flex-1 items-center justify-center rounded-[10px] text-sm ring-1'>
          还没有知识库，点击右上角新建一个。
        </div>
      )}
      <TableFooterSection>
        <TableQsPagination pageSize={pageSize} total={total} />
      </TableFooterSection>
    </ListStack>
  )
}
