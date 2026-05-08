import { fetchUserById } from '@/dal/auth'
import { UserEditForm } from '@/components/auth/user-edit-form'
import { UserEditFormValues } from '@/schemas/auth'

export default async function UserEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchUserById(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserEditForm data={data as UserEditFormValues} />
    </div>
  )
}
