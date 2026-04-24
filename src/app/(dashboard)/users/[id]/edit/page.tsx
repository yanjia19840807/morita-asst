import { notFound } from 'next/navigation'

import { UserEditForm } from '@/components/auth/user-edit-form'
import { fetchUserById } from '@/server/auth'

export default async function UserEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await fetchUserById(id).catch(() => null)

  if (!user) {
    notFound()
  }

  return <UserEditForm user={user} />
}
