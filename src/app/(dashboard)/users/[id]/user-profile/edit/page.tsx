import { UserProfileEditForm } from '@/components/profiles/user-profile-edit-form'
import { PageShell } from '@/components/layout/page-shell'
import { fetchUserProfileByUserId } from '@/modules/profiles/service'

export default async function UserProfileEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await fetchUserProfileByUserId(id)

  return (
    <PageShell>
      <UserProfileEditForm mode='admin' data={profile} />
    </PageShell>
  )
}
