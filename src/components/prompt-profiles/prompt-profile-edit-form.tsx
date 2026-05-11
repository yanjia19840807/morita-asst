'use client'

import { editPromptProfileAction } from '@/modules/prompt-profiles/actions'
import {
  PromptProfileEditFormValues,
  promptProfileEditSchema
} from '@/modules/prompt-profiles/schemas'
import { PromptProfileForm } from './prompt-profile-form'

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
