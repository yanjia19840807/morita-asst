import { UserProfileEditForm } from '@/components/profiles/user-profile-edit-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function MyUserProfileEditPage() {
  const profile = await fetchMyUserProfile()

  return (
    <PageShell>
      <UserProfileEditForm mode='self' data={profile} />
    </PageShell>
  )
}
