import { UserEditForm } from '@/components/auth/user-edit-form'
import { toUserEditFormValues } from '@/modules/auth/mapper'
import { fetchUserById } from '@/modules/auth/service'

export default async function UserEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchUserById(id)

  return <UserEditForm data={toUserEditFormValues(data)} />
}
