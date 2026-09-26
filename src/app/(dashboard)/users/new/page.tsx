import { UserCreateForm } from '@/components/auth/user-create-form'
import { UserSettingsShell } from '@/components/auth/user-settings-shell'
import { PageShell } from '@/components/layout/page-shell'

export default function UserNewPage() {
  return (
    <PageShell>
      <UserSettingsShell>
        <UserCreateForm />
      </UserSettingsShell>
    </PageShell>
  )
}
