'use client'

import type { AgentsWithTotalDto } from '@/modules/agents/dto'
import { ListStack } from '@/components/layout/list-stack'
import { PageEmpty } from '@/components/layout/page-empty'
import TableActionSection from '../table/table-action-section'
import TableFooterSection from '../table/table-footer-section'
import { TableQsPagination } from '../table/table-qs-pagination'
import AgentCard from './agent-card'
import AgentSearch from './agent-search'

interface AgentGridProps {
  data: AgentsWithTotalDto
  pageSize: number
}

export default function AgentGrid({ data, pageSize }: AgentGridProps) {
  const { agents, total } = data

  return (
    <ListStack>
      <TableActionSection>
        <AgentSearch />
      </TableActionSection>
      {agents.length > 0 ? (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4'>
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <PageEmpty
          title='还没有助手'
          description='点击右上角新建一个助手。'
        />
      )}
      <TableFooterSection>
        <TableQsPagination pageSize={pageSize} total={total} />
      </TableFooterSection>
    </ListStack>
  )
}
