'use client'

import { useRef } from 'react'
import { editUserAction } from '@/modules/auth/actions'
import { saveUserProfileByUserIdAction } from '@/modules/profiles/actions'
import {
  UserProfileForm,
  type UserProfileFormHandle
} from '@/components/profiles/user-profile-form'
import {
  userProfileEditSchema,
  type UserProfileEditValues
} from '@/modules/profiles/schemas'
import { UserEditFormValues, userEditSchema } from '@/modules/auth/schemas'
import { UserForm } from './user-form'

export function UserEditForm({
  data,
  profileData
}: {
  data: UserEditFormValues
  profileData?: UserProfileEditValues | null
}) {
  const profileFormRef = useRef<UserProfileFormHandle>(null)

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
      onSubmitAction={async values => {
        const nextValues = values as UserEditFormValues

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

        const result = await editUserAction(nextValues)
        if (!result.success) {
          return result
        }

        if (nextValues.role !== 'admin' && profileValues) {
          const profileResult = await saveUserProfileByUserIdAction(data.id, {
            ...profileValues,
            userId: data.id
          })

          if (!profileResult.success) {
            return profileResult
          }
        }

        return result
      }}
      renderExtra={({ selectedRole }) =>
        selectedRole !== 'admin' && profileData ? (
          <UserProfileForm
            ref={profileFormRef}
            title='用户画像'
            formId='userEmbeddedUserProfileForm'
            backHref={`/users/${data.id}`}
            defaultValues={profileData}
            schema={userProfileEditSchema}
            onSubmitAction={values =>
              saveUserProfileByUserIdAction(data.id, values)
            }
            embedded
            cardDescription='维护该用户的背景信息、主要问题和标签。'
            hideSubmitButton
          />
        ) : null
      }
    />
  )
}
