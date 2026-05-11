import ProfileEditForm from '@/components/auth/profile-edit-form'
import { toProfileEditFormValues } from '@/modules/auth/mapper'
import { fetchProfile } from '@/modules/auth/service'

export default async function ProfileEditPage() {
  const session = await fetchProfile()

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <ProfileEditForm data={toProfileEditFormValues(session.user)} />
    </div>
  )
}
