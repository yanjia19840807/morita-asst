'use client'

import type { AgentsWithTotalDto } from '@/modules/agents/dto'
import { ListStack } from '@/components/layout/list-stack'
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
        <div className='bg-card shadow-md ring-border text-muted-foreground flex min-h-64 flex-1 items-center justify-center rounded-[10px] text-sm ring-1'>
          还没有助手，点击右上角新建一个。
        </div>
      )}
      <TableFooterSection>
        <TableQsPagination pageSize={pageSize} total={total} />
      </TableFooterSection>
    </ListStack>
  )
}
