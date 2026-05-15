import { UserProfileDetail } from '@/components/profiles/user-profile-detail'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function MyUserProfilePage() {
  const profile = await fetchMyUserProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserProfileDetail
        data={profile}
        title='我的画像'
        editHref='/profile/user-profile/edit'
        backHref='/profile'
      />
    </div>
  )
}