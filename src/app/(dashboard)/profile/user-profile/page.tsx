import { UserProfileDetail } from '@/components/profiles/user-profile-detail'
import { PageShell } from '@/components/layout/page-shell'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function MyUserProfilePage() {
  const profile = await fetchMyUserProfile()

  return (
    <PageShell>
      <UserProfileDetail
        data={profile}
        title='我的画像'
        editHref='/profile/user-profile/edit'
        backHref='/profile'
      />
    </PageShell>
  )
}