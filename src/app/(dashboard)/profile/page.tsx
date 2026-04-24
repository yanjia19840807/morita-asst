import ProfileView from '@/components/auth/profile-view'
import { fetchProfile } from '@/server/auth'
import { notFound } from 'next/navigation'

export default async function ProfilePage() {
  const session = await fetchProfile()

  if (!session?.user) {
    return notFound()
  }

  return (
    <div className='flex h-full items-center justify-center'>
      <div className='w-full max-w-lg'>
        <ProfileView session={session} />
      </div>
    </div>
  )
}
