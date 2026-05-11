'use client'

import { editUserAction } from '@/modules/auth/actions'
import { UserEditFormValues, userEditSchema } from '@/modules/auth/schemas'
import { UserForm } from './user-form'

export function UserEditForm({ data }: { data: UserEditFormValues }) {
  const defaultValues: UserEditFormValues = {
    ...data,
    password: undefined,
    role: data.role === 'admin' ? 'admin' : 'user'
  }

  return (
    <UserForm
      mode='Edit'
      title='编辑用户'
      formId='userEditForm'
      defaultValues={defaultValues}
      schema={userEditSchema as never}
      onSubmitAction={values => editUserAction(values as UserEditFormValues)}
    />
  )
}
