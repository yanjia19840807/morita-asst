import ProfileDetail from '@/components/auth/profile-detail'
import { fetchProfile } from '@/dal/auth'

export default async function ProfilePage() {
  const session = await fetchProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <ProfileDetail session={session} />
    </div>
  )
}
