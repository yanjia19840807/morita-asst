import { PromptProfileEditForm } from '@/components/prompt-profiles/prompt-profile-edit-form'
import { fetchPromptProfileById } from '@/dal/prompt-profiles'
import { PromptProfileEditFormValues } from '@/schemas/prompt-profile'

export default async function PromptProfileEditPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchPromptProfileById(id)

  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <PromptProfileEditForm data={data as PromptProfileEditFormValues} />
    </div>
  )
}
