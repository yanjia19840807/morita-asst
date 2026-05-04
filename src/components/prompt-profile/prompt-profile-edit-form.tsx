'use client'

import { editPromptProfileAction } from '@/app/(dashboard)/prompt-profiles/actions'
import { PromptProfileForm } from './prompt-profile-form'
import {
  PromptProfileEditFormValues,
  promptProfileEditSchema
} from '@/schemas/prompt-profile'

export function PromptProfileEditForm({
  data
}: {
  data: PromptProfileEditFormValues
}) {
  return (
    <PromptProfileForm
      title='编辑提示词'
      formId='promptProfileEditForm'
      defaultValues={data}
      schema={promptProfileEditSchema as never}
      onSubmitAction={values =>
        editPromptProfileAction(values as PromptProfileEditFormValues)
      }
    />
  )
}
