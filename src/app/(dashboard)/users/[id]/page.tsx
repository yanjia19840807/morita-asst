import { UserDetail } from '@/components/auth/user-detail'
import { fetchUserById } from '@/modules/auth/service'
import { fetchUserProfileByUserId } from '@/modules/profiles/service'

export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await fetchUserById(id)
  const profile =
    user.role === 'admin' ? null : await fetchUserProfileByUserId(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserDetail user={user} profile={profile} />
    </div>
  )
}
