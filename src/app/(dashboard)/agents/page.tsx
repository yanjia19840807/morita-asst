import { Suspense } from 'react'
import AgentGrid from '@/components/agents/agent-grid'
import PageTitle from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { fetchAgents } from '@/dal/agent'
import { getPage } from '@/lib/pagination'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PaginationParams } from '@/schemas/query'

const pageSize = 12

const CreateBtn = function () {
  return (
    <Button asChild>
      <Link href='/agents/new'>
        <Plus />
        新建助手
      </Link>
    </Button>
  )
}

export default async function AgentsPage({
  searchParams
}: {
  searchParams: Promise<PaginationParams>
}) {
  const { page, searchValue } = await searchParams

  const data = await fetchAgents({
    page: getPage(page),
    pageSize,
    searchValue
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 px-4'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <CreateBtn />
          </div>
        }
      >
        助手管理
      </PageTitle>
      <Suspense fallback={null}>
        <AgentGrid data={data.agents} total={data.total} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}
