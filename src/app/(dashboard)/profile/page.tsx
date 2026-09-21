import ProfileDetail from '@/components/auth/profile-detail'
import { PageShell } from '@/components/layout/page-shell'
import { fetchProfile } from '@/modules/auth/service'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function ProfilePage() {
  const session = await fetchProfile()
  const profile =
    session.user.role === 'admin' ? null : await fetchMyUserProfile()

  return (
    <PageShell>
      <ProfileDetail user={session.user} profile={profile} />
    </PageShell>
  )
}
