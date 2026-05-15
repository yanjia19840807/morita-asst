import { UserProfileEditForm } from '@/components/profiles/user-profile-edit-form'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function MyUserProfileEditPage() {
  const profile = await fetchMyUserProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserProfileEditForm mode='self' data={profile} />
    </div>
  )
}
