import { UserDetail } from '@/components/auth/user-detail'
import { fetchUserById } from '@/modules/auth/service'

export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await fetchUserById(id)

  return <UserDetail user={user} />
}
