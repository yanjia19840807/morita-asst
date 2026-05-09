import { fetchKnowledges } from '@/dal/knowledges'
import { getPage } from '@/lib/pagination'
import PageTitle from '@/components/layout/page-title'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { PaginationParams } from '@/schemas/query'
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
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-4'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <CreateBtn />
          </div>
        }
      >
        知识库
      </PageTitle>
      <div className='flex min-h-0 flex-1'>
        <Suspense fallback={null}>
          <KnowledgeGrid data={data} pageSize={pageSize} />
        </Suspense>
      </div>
    </div>
  )
}
