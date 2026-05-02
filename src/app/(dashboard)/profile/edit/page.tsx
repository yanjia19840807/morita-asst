import ProfileEditForm from '@/components/auth/profile-edit-form'
import { fetchProfile } from '@/data-access/auth'

export default async function ProfileEditPage() {
  const session = await fetchProfile()

  if (!session?.user) {
    return null
  }

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <ProfileEditForm data={session.user} />
    </div>
  )
}
