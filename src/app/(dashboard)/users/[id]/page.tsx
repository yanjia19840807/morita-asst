import { UserDetail } from '@/components/auth/user-detail'
import { PageShell } from '@/components/layout/page-shell'
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
    <PageShell>
      <UserDetail user={user} profile={profile} />
    </PageShell>
  )
}
