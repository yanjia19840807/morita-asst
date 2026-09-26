'use client'

import { createUserAction } from '@/modules/auth/actions'
import { UserCreateFormValues, userCreateSchema } from '@/modules/auth/schemas'
import { UserForm } from './user-form'

function extractCreatedUserId(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const result = data as {
    id?: unknown
    user?: {
      id?: unknown
    }
  }

  if (typeof result.id === 'string' && result.id) {
    return result.id
  }

  if (typeof result.user?.id === 'string' && result.user.id) {
    return result.user.id
  }

  return null
}

export function UserCreateForm() {
  const defaultValues: UserCreateFormValues = {
    email: '',
    name: '',
    role: 'user' as 'user' | 'admin',
    image: undefined
  }

  return (
    <UserForm
      mode='Create'
      title='新增用户'
      formId='userCreateForm'
      embedded
      defaultValues={defaultValues}
      schema={userCreateSchema as never}
      successMessage='账号已创建，请设置登录密码'
      getSuccessHref={data => {
        const createdUserId = extractCreatedUserId(data)
        return createdUserId ? `/users/${createdUserId}/security` : '/users'
      }}
      onSubmitAction={values => createUserAction(values as UserCreateFormValues)}
    />
  )
}
