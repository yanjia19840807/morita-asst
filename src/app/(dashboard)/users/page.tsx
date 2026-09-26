import { Suspense } from 'react'
import { fetchUsers } from '@/modules/auth/service'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { UserTable } from '@/components/auth/user-table'
import { PageHeader } from '@/components/layout/page-title'
import { PageShell } from '@/components/layout/page-shell'
import { getPage } from '@/lib/pagination'

interface UsersPageProps {
  page?: number
  searchValue?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const pageSize = 10

const CreateBtn = function () {
  return (
    <Button nativeButton={false} render={<Link href='/users/new' />}>
      <Plus />
      新增
    </Button>
  )
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<UsersPageProps>
}) {
  const { page, searchValue, sortBy, sortDirection } = await searchParams

  const data = await fetchUsers({
    page: getPage(page),
    pageSize,
    searchValue,
    sortBy,
    sortDirection
  })

  return (
    <PageShell>
      <PageHeader
        title='用户'
        description='管理账号、角色和访问权限'
        actions={<CreateBtn />}
      />
      <Suspense fallback={null}>
        <UserTable data={data.users} total={data.total} pageSize={pageSize} />
      </Suspense>
    </PageShell>
  )
}
