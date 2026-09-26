import type { ReactNode } from 'react'
import { UserSettingsShell } from '@/components/auth/user-settings-shell'
import { PageShell } from '@/components/layout/page-shell'
import { fetchUserById } from '@/modules/auth/service'

export default async function UserSettingsLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await fetchUserById(id)

  return (
    <PageShell>
      <UserSettingsShell user={user}>{children}</UserSettingsShell>
    </PageShell>
  )
}
