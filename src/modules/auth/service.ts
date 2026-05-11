import { auth } from './server'
import { headers } from 'next/headers'
import z from 'zod'
import type { PaginationParams } from '@/lib/query'
import {
  toAuthSessionDto,
  toAuthSessionUserDto,
  toAuthUserDto,
  toAuthUsersListDto
} from './mapper'
import type { AuthSessionDto, AuthUserDto, AuthUsersListDto } from './dto'
import {
  emailSignInSchema,
  emailSignUpSchema,
  forgotPasswordSchema,
  profileEditSchema,
  profilePasswordSchema,
  resetPasswordSchema,
  userBanSchema,
  userCreateSchema,
  userEditSchema,
  userIdSchema,
  type EmailSignInFormValues,
  type EmailSignUpFormValues,
  type ForgotPasswordFormValues,
  type ProfileEditFormValues,
  type ProfilePasswordFormValues,
  type ResetPasswordFormValues,
  type UserBanValues,
  type UserCreateFormValues,
  type UserEditFormValues,
  type UserId
} from './schemas'
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError
} from '@/lib/api/errors'

export type SessionUser = AuthUserDto

export type FetchUsersParams = PaginationParams & {
  searchField?: 'name' | 'email'
}

export type fetchUsersParams = FetchUsersParams

async function getRequestHeaders() {
  return headers()
}

async function getRequiredSessionData() {
  const session = await auth.api.getSession({
    headers: await getRequestHeaders()
  })

  if (!session?.user) {
    throw new UnauthorizedError()
  }

  return session
}

export async function signUpEmail(data: EmailSignUpFormValues) {
  const validation = emailSignUpSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { email, name, password } = validation.data

  return auth.api.signUpEmail({
    body: {
      email,
      name,
      password
    }
  })
}

export async function signInEmail(data: EmailSignInFormValues) {
  const validation = emailSignInSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { email, password } = validation.data

  return auth.api.signInEmail({
    body: {
      email,
      password
    },
    headers: await getRequestHeaders()
  })
}

export async function forgotPassword(data: ForgotPasswordFormValues) {
  const validation = forgotPasswordSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return auth.api.requestPasswordReset({
    body: {
      email: validation.data.email,
      redirectTo: '/reset-password/email'
    }
  })
}

export async function resetPassword(data: ResetPasswordFormValues) {
  const validation = resetPasswordSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { password, token } = validation.data

  return auth.api.resetPassword({
    body: {
      newPassword: password,
      token
    }
  })
}

export async function changePassword(data: ProfilePasswordFormValues) {
  await requireAuth()
  const validation = profilePasswordSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { currentPassword, newPassword } = validation.data
  return auth.api.changePassword({
    body: {
      currentPassword,
      newPassword
    },
    headers: await getRequestHeaders()
  })
}

export async function editProfile(data: Omit<ProfileEditFormValues, 'id'>) {
  await requireAuth()
  const validation = profileEditSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { name, image } = validation.data

  return auth.api.updateUser({
    body: {
      name,
      image: (image || null) as string | null
    },
    headers: await getRequestHeaders()
  })
}

export async function fetchProfile(): Promise<AuthSessionDto> {
  const session = await getRequiredSessionData()
  return toAuthSessionDto(session)
}

export async function fetchUsers(
  params: fetchUsersParams
): Promise<AuthUsersListDto> {
  await requireRoles(['admin'])

  const {
    page = 1,
    pageSize = 10,
    searchField = 'name',
    searchValue,
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = params

  const result = await auth.api.listUsers({
    query: {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      searchField,
      searchValue,
      sortBy,
      sortDirection
    },
    headers: await getRequestHeaders()
  })

  return toAuthUsersListDto(result)
}

export async function fetchUserById(
  id: NonNullable<Parameters<typeof auth.api.getUser>[0]>['query']['id']
): Promise<AuthUserDto> {
  await requireRoles(['admin'])

  const user = await auth.api.getUser({
    query: { id },
    headers: await getRequestHeaders()
  })

  return toAuthUserDto(user)
}

export async function createUser(data: UserCreateFormValues) {
  await requireRoles(['admin'])
  const validation = userCreateSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { email, name, password, role, image } = validation.data

  return auth.api.createUser({
    body: {
      email,
      name,
      password,
      role,
      data: {
        image: image || null
      }
    },
    headers: await getRequestHeaders()
  })
}

export async function editUser(data: UserEditFormValues) {
  await requireRoles(['admin'])
  const validation = userEditSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, name, role, image, password } = validation.data

  const result = await auth.api.adminUpdateUser({
    body: {
      userId: id,
      data: {
        name,
        role,
        image
      }
    },
    headers: await getRequestHeaders()
  })

  if (password) {
    await auth.api.setUserPassword({
      body: {
        userId: id,
        newPassword: password
      },
      headers: await getRequestHeaders()
    })
  }

  return result
}

export async function removeUser(id: UserId) {
  await requireRoles(['admin'])
  const validation = userIdSchema.safeParse(id)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return auth.api.removeUser({
    body: {
      userId: validation.data
    },
    headers: await getRequestHeaders()
  })
}

export async function banUser(data: UserBanValues) {
  await requireRoles(['admin'])
  const validation = userBanSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, banReason } = validation.data
  return auth.api.banUser({
    body: {
      userId: id,
      banReason
    },
    headers: await getRequestHeaders()
  })
}

export async function unbanUser(id: UserId) {
  await requireRoles(['admin'])
  const validation = userIdSchema.safeParse(id)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  return auth.api.unbanUser({
    body: {
      userId: validation.data
    },
    headers: await getRequestHeaders()
  })
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getRequiredSessionData()
  return toAuthSessionUserDto(session.user)
}

export async function requireRoles(roles: string[]): Promise<SessionUser> {
  const user = await requireAuth()
  const userRoles = user.role ? user.role.split(',').map(r => r.trim()) : []
  const hasRole = userRoles.some(r => roles.includes(r))
  if (!hasRole) {
    throw new ForbiddenError()
  }
  return user
}
