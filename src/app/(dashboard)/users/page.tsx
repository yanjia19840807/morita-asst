import { Suspense } from 'react'
import { fetchUsers } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import PageActionBar from '@/components/page-action-bar'
import { UserTable } from '@/components/auth/user-table'

interface UsersPageProps {
  page?: number
  searchValue?: string
  searchField?: 'name' | 'email'
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<UsersPageProps>
}) {
  const PAGE_SIZE = 10
  const {
    page,
    searchValue,
    searchField = 'name',
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = await searchParams

  const getOffsetValue = () => {
    if (page && Number(page)) {
      const toFixedValue = Number(Number(page).toFixed(0))
      return toFixedValue <= 1 ? 0 : (toFixedValue - 1) * PAGE_SIZE
    } else {
      return 0
    }
  }

  const query = {
    limit: PAGE_SIZE,
    offset: getOffsetValue(),
    searchField,
    searchValue,
    sortBy,
    sortDirection
  }

  const data = await fetchUsers(query)

  return (
    <div>
      <PageActionBar>
        <Button asChild>
          <Link href='/users/new'>
            <Plus />
            新增
          </Link>
        </Button>
      </PageActionBar>
      <Suspense fallback={<div>Loading...</div>}>
        <UserTable data={data.users} total={data.total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  )
}
