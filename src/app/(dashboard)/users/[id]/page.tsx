import { UserDetail } from '@/components/auth/user-detail'
import { fetchUserById } from '@/modules/auth/service'

export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await fetchUserById(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserDetail user={user} />
    </div>
  )
}
