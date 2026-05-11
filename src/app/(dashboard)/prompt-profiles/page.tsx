import { Suspense } from 'react'
import PageTitle from '@/components/layout/page-title'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { PromptProfileTable } from '@/components/prompt-profiles/prompt-profile-table'
import { getPage } from '@/lib/pagination'
import { fetchPromptProfiles } from '@/modules/prompt-profiles/service'

interface PromptProfilesPageProps {
  page?: number
  searchValue?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const pageSize = 10

const CreateBtn = function () {
  return (
    <Button asChild>
      <Link href='/prompt-profiles/new'>
        <Plus />
        新建提示词
      </Link>
    </Button>
  )
}

export default async function PromptProfilesPage({
  searchParams
}: {
  searchParams: Promise<PromptProfilesPageProps>
}) {
  const { page, searchValue, sortBy, sortDirection } = await searchParams

  const data = await fetchPromptProfiles({
    page: getPage(page),
    pageSize,
    searchValue,
    sortBy,
    sortDirection
  })

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <CreateBtn />
          </div>
        }
      >
        提示词管理
      </PageTitle>
      <Suspense fallback={null}>
        <PromptProfileTable
          data={data.promptProfiles}
          total={data.total}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  )
}
