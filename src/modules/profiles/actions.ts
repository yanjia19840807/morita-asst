'use server'

import { revalidatePath } from 'next/cache'
import {
  handleActionError,
  handleActionResult,
  type ResponseResult
} from '@/lib/api/response'
import {
  saveMyUserProfile,
  saveUserProfileByUserId,
  type UserProfileDetailDto
} from './index'
import type { UserProfileEditValues } from './schemas'

const myProfilePath = '/profile/user-profile'

function userProfilePath(userId: string) {
  return `/users/${userId}/user-profile`
}

export async function saveMyUserProfileAction(
  data: UserProfileEditValues
): Promise<ResponseResult<UserProfileDetailDto>> {
  try {
    const result = await saveMyUserProfile(data)
    revalidatePath('/profile')
    revalidatePath('/profile/edit')
    revalidatePath(myProfilePath)
    revalidatePath(`${myProfilePath}/edit`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function saveUserProfileByUserIdAction(
  userId: string,
  data: UserProfileEditValues
): Promise<ResponseResult<UserProfileDetailDto>> {
  try {
    const result = await saveUserProfileByUserId(userId, data)
    revalidatePath(`/users/${userId}`)
    revalidatePath(`/users/${userId}/edit`)
    revalidatePath(userProfilePath(userId))
    revalidatePath(`${userProfilePath(userId)}/edit`)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}
