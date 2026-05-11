'use client'

import { createUserAction } from '@/modules/auth/actions'
import { UserCreateFormValues, userCreateSchema } from '@/modules/auth/schemas'
import { UserForm } from './user-form'

export function UserCreateForm() {
  const defaultValues: UserCreateFormValues = {
    email: '',
    name: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    image: undefined
  }

  return (
    <UserForm
      mode='Create'
      title='新增用户'
      formId='userCreateForm'
      defaultValues={defaultValues}
      schema={userCreateSchema as never}
      onSubmitAction={values =>
        createUserAction(values as UserCreateFormValues)
      }
    />
  )
}
