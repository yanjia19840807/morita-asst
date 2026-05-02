import ProfileView from '@/components/auth/profile-view'
import { fetchProfile } from '@/data-access/auth'

export default async function ProfilePage() {
  const session = await fetchProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <ProfileView session={session} />
    </div>
  )
}
