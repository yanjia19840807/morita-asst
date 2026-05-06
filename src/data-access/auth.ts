import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError
} from '@/lib/api/server/errors'
import { auth } from '@/lib/auth'
import {
  EmailSignInFormValues,
  emailSignInSchema,
  EmailSignUpFormValues,
  emailSignUpSchema,
  ForgotPasswordFormValues,
  forgotPasswordSchema,
  ResetPasswordFormValues,
  resetPasswordSchema,
  ProfileEditFormValues,
  profileEditSchema,
  ProfilePasswordFormValues,
  profilePasswordSchema,
  userBanSchema,
  UserBanValues,
  UserCreateFormValues,
  userCreateSchema,
  UserEditFormValues,
  userEditSchema,
  UserId,
  userIdSchema
} from '@/schemas/auth'
import { headers } from 'next/headers'
import z from 'zod'

export type FetchUsersResult = Awaited<ReturnType<typeof auth.api.listUsers>>
export type UserRow = FetchUsersResult['users'][number]
export type FetchSessionResult = Awaited<ReturnType<typeof auth.api.getSession>>
export type SessionUser = NonNullable<FetchSessionResult>['user']

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

  return await auth.api.signInEmail({
    body: {
      email,
      password
    },
    headers: await headers()
  })
}

export async function forgotPassword(data: ForgotPasswordFormValues) {
  const validation = forgotPasswordSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const { email } = validation.data

  return await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: '/reset-password/email' // URL to redirect the user after resetting the password.
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
    headers: await headers()
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
    headers: await headers()
  })
}

export async function fetchProfile() {
  await requireAuth()
  return auth.api.getSession({
    headers: await headers()
  })
}

export type fetchUsersParams = {
  page?: number
  pageSize?: number
  searchField?: 'name' | 'email'
  searchValue?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export async function fetchUsers({
  page = 1,
  pageSize = 10,
  searchField = 'name',
  searchValue,
  sortBy = 'createdAt',
  sortDirection = 'desc'
}: fetchUsersParams) {
  await requireRoles(['admin'])
  return auth.api.listUsers({
    query: {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      searchField,
      searchValue,
      sortBy,
      sortDirection
    },
    headers: await headers()
  })
}

export async function fetchUserById(
  id: NonNullable<Parameters<typeof auth.api.getUser>[0]>['query']['id']
) {
  await requireRoles(['admin'])
  return auth.api.getUser({
    query: { id },
    headers: await headers()
  })
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
    headers: await headers()
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
    headers: await headers()
  })

  if (password) {
    await auth.api.setUserPassword({
      body: {
        userId: id,
        newPassword: password
      },
      headers: await headers()
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

  const userId = validation.data

  return auth.api.removeUser({
    body: { userId },
    headers: await headers()
  })
}

export async function banUser(data: UserBanValues) {
  await requireRoles(['admin'])

  const validation = userBanSchema.safeParse(data)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }

  const { id, banReason } = data

  return auth.api.banUser({
    body: {
      userId: id,
      banReason
    },
    headers: await headers()
  })
}

export async function unbanUser(id: UserId) {
  await requireRoles(['admin'])

  const validation = userIdSchema.safeParse(id)
  if (!validation.success) {
    throw new ValidationError(z.prettifyError(validation.error))
  }
  const userId = validation.data

  return auth.api.unbanUser({
    body: {
      userId
    },
    headers: await headers()
  })
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session?.user) throw new UnauthorizedError()
  return session.user
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
