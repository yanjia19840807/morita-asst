import { UserEditForm } from '@/components/auth/user-edit-form'
import { toUserEditFormValues } from '@/modules/auth/mapper'
import { fetchUserById } from '@/modules/auth/service'
import {
  fetchUserProfileByUserId,
  toUserProfileEditValues
} from '@/modules/profiles'

export default async function UserEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchUserById(id)
  const profile =
    data.role === 'admin' ? null : await fetchUserProfileByUserId(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserEditForm
        data={toUserEditFormValues(data)}
        profileData={profile ? toUserProfileEditValues(profile) : null}
      />
    </div>
  )
}
