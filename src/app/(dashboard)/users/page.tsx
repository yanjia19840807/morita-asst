import { Suspense } from 'react'
import { fetchUsers } from '@/dal/auth'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { UserTable } from '@/components/auth/user-table'
import PageTitle from '@/components/layout/page-title'
import { getPage } from '@/lib/pagination'

interface UsersPageProps {
  page?: number
  searchValue?: string
  searchField?: 'name' | 'email'
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

const pageSize = 10

const CreateBtn = function () {
  return (
    <Button asChild>
      <Link href='/users/new'>
        <Plus />
        新增
      </Link>
    </Button>
  )
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<UsersPageProps>
}) {
  const { page, searchValue, searchField, sortBy, sortDirection } =
    await searchParams

  const data = await fetchUsers({
    page: getPage(page),
    pageSize,
    searchField,
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
        用户列表
      </PageTitle>
      <Suspense fallback={null}>
        <UserTable data={data.users} total={data.total} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}
