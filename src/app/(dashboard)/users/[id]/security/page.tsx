import { UserSecurityForm } from '@/components/auth/user-security-form'

export default async function UserSecurityPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <UserSecurityForm userId={id} />
}
