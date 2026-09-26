import { UserProfilePane } from '@/components/profiles/user-profile-pane'
import { fetchUserProfileByUserId } from '@/modules/profiles/service'

export default async function UserProfilePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await fetchUserProfileByUserId(id)

  return <UserProfilePane profile={profile} mode='admin' />
}
