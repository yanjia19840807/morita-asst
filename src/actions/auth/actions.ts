'use server'

import { auth } from '@/lib/auth'
import {
  EmailSignInFormValues,
  EmailSignUpFormValues,
  ForgotPasswordFormValues,
  ProfileEditFormValues,
  ProfilePasswordFormValues,
  ResetPasswordFormValues,
  UserCreateFormValues,
  UserEditFormValues,
  UserId,
  UserBanValues
} from '@/schemas/auth'
import { ResponseResult } from '@/lib/api/shared/response'
import {
  handleActionError,
  handleActionResult
} from '@/lib/api/server/response'
import { revalidatePath } from 'next/cache'
import {
  banUser,
  createUser,
  removeUser,
  unbanUser,
  editUser,
  signUpEmail,
  signInEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  editProfile
} from '@/dal/auth'

const usersPath = '/users'
const profilePath = '/profile'

function getUserDetailPath(userId: string) {
  return `${usersPath}/${userId}`
}

function revalidateUsers() {
  revalidatePath(usersPath)
}

function revalidateProfile() {
  revalidatePath(profilePath)
  revalidatePath(`${profilePath}/edit`)
}

function revalidateUserDetail(userId: string) {
  revalidatePath(getUserDetailPath(userId))
}

export async function signUpEmailAction(
  data: EmailSignUpFormValues
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.signUpEmail>>>> {
  try {
    const result = await signUpEmail(data)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function signInEmailAction(
  data: EmailSignInFormValues
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.signInEmail>>>> {
  try {
    const result = await signInEmail(data)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function forgotPasswordAction(
  data: ForgotPasswordFormValues
): Promise<
  ResponseResult<Awaited<ReturnType<typeof auth.api.requestPasswordReset>>>
> {
  try {
    const result = await forgotPassword(data)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function resetPasswordAction(
  data: ResetPasswordFormValues
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.resetPassword>>>> {
  try {
    const result = await resetPassword(data)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function changePasswordAction(
  data: ProfilePasswordFormValues
): Promise<
  ResponseResult<Awaited<ReturnType<typeof auth.api.changePassword>>>
> {
  try {
    const result = await changePassword(data)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editProfileAction(
  data: Omit<ProfileEditFormValues, 'id'>
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.updateUser>>>> {
  try {
    const result = await editProfile(data)
    revalidateProfile()
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function createUserAction(
  data: UserCreateFormValues
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.createUser>>>> {
  try {
    const result = await createUser(data)
    revalidateUsers()
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function editUserAction(
  data: UserEditFormValues
): Promise<
  ResponseResult<Awaited<ReturnType<typeof auth.api.adminUpdateUser>>>
> {
  try {
    const result = await editUser(data)
    revalidateUsers()
    revalidateUserDetail(data.id)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function removeUserAction(
  id: UserId
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.removeUser>>>> {
  try {
    const result = await removeUser(id)
    revalidateUsers()
    revalidateUserDetail(id)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function banUserAction(
  data: UserBanValues
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.banUser>>>> {
  try {
    const result = await banUser(data)
    revalidateUsers()
    revalidateUserDetail(data.id)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function unbanUserAction(
  id: UserId
): Promise<ResponseResult<Awaited<ReturnType<typeof auth.api.unbanUser>>>> {
  try {
    const result = await unbanUser(id)
    revalidateUsers()
    revalidateUserDetail(id)
    return handleActionResult(result)
  } catch (error) {
    return handleActionError(error)
  }
}

export async function bulkRemoveUsersAction(data: UserId[]) {
  try {
    const ids = data.filter(Boolean)
    await Promise.all(ids.map(userId => removeUser(userId)))
    revalidateUsers()
    return handleActionResult()
  } catch (error) {
    return handleActionError(error)
  }
}

export async function bulkBanUsersAction(data: UserId[]) {
  try {
    await Promise.all(
      data.map(id => banUser({ id, banReason: '由管理员批量禁用' }))
    )
    revalidateUsers()
    return handleActionResult()
  } catch (error) {
    return handleActionError(error)
  }
}

export async function bulkUnbanUsersAction(data: UserId[]) {
  try {
    await Promise.all(data.map(id => unbanUser(id)))
    revalidateUsers()
    return handleActionResult()
  } catch (error) {
    return handleActionError(error)
  }
}
