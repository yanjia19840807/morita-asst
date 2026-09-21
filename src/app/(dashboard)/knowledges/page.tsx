import { fetchKnowledges } from '@/modules/knowledges/service'
import { getPage } from '@/lib/pagination'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PaginationParams } from '@/lib/query'
import KnowledgeGrid from '@/components/knowledges/knowledge-grid'

const CreateBtn = function () {
  return (
    <Button asChild>
      <Link href='/knowledges/new'>
        <Plus />
        新建知识库
      </Link>
    </Button>
  )
}

const pageSize = 12

export default async function KnowledgePage({
  searchParams
}: {
  searchParams: Promise<PaginationParams>
}) {
  const { page, searchField, searchValue } = await searchParams

  const data = await fetchKnowledges({
    page: getPage(page),
    pageSize,
    searchField,
    searchValue
  })

  return (
    <PageShell>
      <PageHeader
        title='知识库'
        description='整理案例与资料，供助手检索使用'
        actions={<CreateBtn />}
      />
      <div className='flex min-h-0 flex-1'>
        <Suspense fallback={null}>
          <KnowledgeGrid data={data} pageSize={pageSize} />
        </Suspense>
      </div>
    </PageShell>
  )
}
