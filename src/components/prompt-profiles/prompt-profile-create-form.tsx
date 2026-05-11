'use client'

import {
  PromptProfileCreateFormValues,
  promptProfileCreateSchema
} from '@/modules/prompt-profiles/schemas'
import { createPromptProfileAction } from '@/modules/prompt-profiles/actions'
import { PromptProfileForm } from './prompt-profile-form'

export function PromptProfileCreateForm() {
  const defaultValues: PromptProfileCreateFormValues = {
    name: '',
    systemPrompt: ''
  }

  return (
    <PromptProfileForm
      title='新建提示词'
      formId='promptProfileCreateForm'
      defaultValues={defaultValues}
      schema={promptProfileCreateSchema as never}
      onSubmitAction={values =>
        createPromptProfileAction(values as PromptProfileCreateFormValues)
      }
    />
  )
}
