import { Suspense } from 'react'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
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
    <Button nativeButton={false} render={<Link href='/prompt-profiles/new' />}>
      <Plus />
      新建提示词
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
    <PageShell>
      <PageHeader
        title='提示词'
        description='维护助手使用的系统提示词模板'
        actions={<CreateBtn />}
      />
      <Suspense fallback={null}>
        <PromptProfileTable
          data={data.promptProfiles}
          total={data.total}
          pageSize={pageSize}
        />
      </Suspense>
    </PageShell>
  )
}
