import { UserCreateForm } from '@/components/auth/user-create-form'
import { PageShell } from '@/components/layout/page-shell'

export default function UserNewPage() {
  return (
    <PageShell>
      <UserCreateForm />
    </PageShell>
  )
}
