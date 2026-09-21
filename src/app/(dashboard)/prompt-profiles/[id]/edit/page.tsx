import { PromptProfileEditForm } from '@/components/prompt-profiles/prompt-profile-edit-form'
import { PageShell } from '@/components/layout/page-shell'
import { PromptProfileEditFormValues } from '@/modules/prompt-profiles/schemas'
import { fetchPromptProfileById } from '@/modules/prompt-profiles/service'

export default async function PromptProfileEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchPromptProfileById(id)

  return (
    <PageShell>
      <PromptProfileEditForm data={data as PromptProfileEditFormValues} />
    </PageShell>
  )
}
