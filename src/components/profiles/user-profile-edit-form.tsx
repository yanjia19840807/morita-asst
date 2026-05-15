'use client'

import {
  saveMyUserProfileAction,
  saveUserProfileByUserIdAction
} from '@/modules/profiles/actions'
import {
  userProfileEditSchema,
  type UserProfileEditValues
} from '@/modules/profiles/schemas'
import { UserProfileForm } from './user-profile-form'

type UserProfileEditFormProps = {
  mode: 'self' | 'admin'
  data: UserProfileEditValues
}

export function UserProfileEditForm({ mode, data }: UserProfileEditFormProps) {
  const isSelf = mode === 'self'

  return (
    <UserProfileForm
      title={isSelf ? '编辑我的画像' : '编辑用户画像'}
      formId={isSelf ? 'myUserProfileEditForm' : 'adminUserProfileEditForm'}
      backHref={
        isSelf ? '/profile/user-profile' : `/users/${data.userId}/user-profile`
      }
      successHref={
        isSelf ? '/profile/user-profile' : `/users/${data.userId}/user-profile`
      }
      defaultValues={data}
      schema={userProfileEditSchema}
      onSubmitAction={values =>
        isSelf
          ? saveMyUserProfileAction(values)
          : saveUserProfileByUserIdAction(data.userId, values)
      }
    />
  )
}
