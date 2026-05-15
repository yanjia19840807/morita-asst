import { UserProfileEditForm } from '@/components/profiles/user-profile-edit-form'
import { fetchUserProfileByUserId } from '@/modules/profiles/service'

export default async function UserProfileEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await fetchUserProfileByUserId(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserProfileEditForm mode='admin' data={profile} />
    </div>
  )
}
