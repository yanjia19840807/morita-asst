import { UserProfileDetail } from '@/components/profiles/user-profile-detail'
import { PageShell } from '@/components/layout/page-shell'
import { fetchUserProfileByUserId } from '@/modules/profiles/service'

export default async function UserProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await fetchUserProfileByUserId(id)

  return (
    <PageShell>
      <UserProfileDetail
        data={profile}
        title='用户画像'
        editHref={`/users/${id}/user-profile/edit`}
        backHref={`/users/${id}`}
      />
    </PageShell>
  )
}