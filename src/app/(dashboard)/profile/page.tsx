import ProfileDetail from '@/components/auth/profile-detail'
import { fetchProfile } from '@/modules/auth/service'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function ProfilePage() {
  const session = await fetchProfile()
  const profile =
    session.user.role === 'admin' ? null : await fetchMyUserProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <ProfileDetail user={session.user} profile={profile} />
    </div>
  )
}
