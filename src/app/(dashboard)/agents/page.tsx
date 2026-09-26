import { Suspense } from 'react'
import AgentGrid from '@/components/agents/agent-grid'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { Button } from '@/components/ui/button'
import { fetchAgents } from '@/modules/agents/service'
import { getPage } from '@/lib/pagination'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PaginationParams } from '@/lib/query'

const pageSize = 12

const CreateBtn = function () {
  return (
    <Button nativeButton={false} render={<Link href='/agents/new' />}>
      <Plus />
      新建助手
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
    <PageShell>
      <PageHeader
        title='助手'
        description='创建和管理对话助手'
        actions={<CreateBtn />}
      />
      <Suspense fallback={null}>
        <AgentGrid data={data} pageSize={pageSize} />
      </Suspense>
    </PageShell>
  )
}
