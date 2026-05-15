'use client'

import { useRef } from 'react'
import { createUserAction } from '@/modules/auth/actions'
import { saveUserProfileByUserIdAction } from '@/modules/profiles/actions'
import {
  UserProfileForm,
  type UserProfileFormHandle
} from '@/components/profiles/user-profile-form'
import { UserCreateFormValues, userCreateSchema } from '@/modules/auth/schemas'
import {
  userProfileEditSchema,
  type UserProfileEditValues
} from '@/modules/profiles/schemas'
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
  const profileFormRef = useRef<UserProfileFormHandle>(null)

  const defaultValues: UserCreateFormValues = {
    email: '',
    name: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    image: undefined
  }

  const profileDefaultValues: UserProfileEditValues = {
    id: null,
    userId: 'pending-user',
    gender: null,
    ageRange: null,
    occupation: null,
    issues: []
  }

  return (
    <UserForm
      mode='Create'
      title='新增用户'
      formId='userCreateForm'
      defaultValues={defaultValues}
      schema={userCreateSchema as never}
      onSubmitAction={async values => {
        const nextValues = values as UserCreateFormValues

        const profileValues =
          nextValues.role !== 'admin' && profileFormRef.current
            ? await profileFormRef.current.getValidatedValues()
            : null

        if (
          nextValues.role !== 'admin' &&
          profileFormRef.current &&
          !profileValues
        ) {
          return {
            success: false as const,
            error: { message: '请先完善用户画像后再保存' }
          }
        }

        const result = await createUserAction(nextValues)
        if (!result.success) {
          return result
        }

        if (nextValues.role !== 'admin' && profileValues) {
          const createdUserId = extractCreatedUserId(result.data)

          if (!createdUserId) {
            return {
              success: false as const,
              error: {
                message: '用户已创建，但未能获取用户 ID，请进入编辑页补充画像'
              }
            }
          }

          const profileResult = await saveUserProfileByUserIdAction(
            createdUserId,
            {
              ...profileValues,
              userId: createdUserId
            }
          )

          if (!profileResult.success) {
            return profileResult
          }
        }

        return result
      }}
      renderExtra={({ selectedRole }) =>
        selectedRole !== 'admin' ? (
          <UserProfileForm
            ref={profileFormRef}
            title='用户画像'
            formId='userCreateProfileForm'
            backHref='/users'
            defaultValues={profileDefaultValues}
            schema={userProfileEditSchema}
            onSubmitAction={values =>
              saveUserProfileByUserIdAction(values.userId, values)
            }
            embedded
            cardDescription='新增普通用户时，同时补充其背景信息、主要问题和标签。'
            hideSubmitButton
          />
        ) : null
      }
    />
  )
}
