import { notFound } from 'next/navigation'

import { UserDetailView } from '@/components/auth/user-detail-view'
import { fetchUserById } from '@/server/auth'

export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await fetchUserById(id)

  if (!user) {
    notFound()
  }

  return <UserDetailView user={user} />
}
