'use server'

import { revalidatePath } from 'next/cache'

import {
  UserCreateSchema,
  UserIdSchema,
  UserToggleBanSchema,
  UserUpdateSchema
} from '@/schemas/auth'
import {
  banUser,
  createUser,
  removeUser,
  setUserPassword,
  unbanUser,
  updateUser
} from '@/server/auth'

const usersPath = '/users'

function getUserDetailPath(userId: string) {
  return `${usersPath}/${userId}`
}

function revalidateUsers() {
  revalidatePath(usersPath)
}

function revalidateUserDetail(userId: string) {
  revalidatePath(getUserDetailPath(userId))
}

export async function removeUserAction(input: { userId: string }) {
  const { userId } = UserIdSchema.parse(input)

  await removeUser({ userId })
  revalidateUsers()
  revalidateUserDetail(userId)

  return {
    success: true,
    message: '用户已删除'
  }
}

export async function toggleUserBanAction(input: {
  userId: string
  banned: boolean
  banReason?: string
}) {
  const { userId, banned, banReason } = UserToggleBanSchema.parse(input)

  if (banned) {
    await unbanUser({ userId })
  } else {
    await banUser({
      userId,
      banReason: banReason || '由管理员禁用'
    })
  }

  revalidateUsers()
  revalidateUserDetail(userId)

  return {
    success: true,
    message: banned ? '用户已启用' : '用户已禁用'
  }
}

export async function updateUserAction(input: {
  userId: string
  name?: string
  role?: string | string[]
  image?: string | null
}) {
  const { userId, name, role, image } = UserUpdateSchema.parse(input)

  const data: Record<string, unknown> = {}

  if (name !== undefined) {
    data.name = name
  }

  if (role !== undefined) {
    data.role = role
  }

  if (image !== undefined) {
    data.image = image
  }

  await updateUser({
    userId,
    data
  })

  revalidateUsers()
  revalidateUserDetail(userId)

  return {
    success: true,
    message: '用户信息已更新'
  }
}

export async function resetUserPasswordAction(input: { userId: string }) {
  const { userId } = UserIdSchema.parse(input)

  const defaultPassword = process.env.USER_DEFAULT_PASSWORD
  if (!defaultPassword) {
    throw new Error('未配置默认密码')
  }

  await setUserPassword({ userId, newPassword: defaultPassword })

  revalidateUserDetail(userId)

  return {
    success: true,
    message: '密码已重置为默认密码'
  }
}

export async function bulkRemoveUsersAction(input: { userIds: string[] }) {
  const ids = input.userIds.filter(Boolean)
  await Promise.all(ids.map(userId => removeUser({ userId })))
  revalidateUsers()
  return { success: true, message: `已删除 ${ids.length} 个用户` }
}

export async function bulkBanUsersAction(input: { userIds: string[] }) {
  const ids = input.userIds.filter(Boolean)
  await Promise.all(
    ids.map(userId => banUser({ userId, banReason: '由管理员批量禁用' }))
  )
  revalidateUsers()
  return { success: true, message: `已禁用 ${ids.length} 个用户` }
}

export async function createUserAction(input: {
  email: string
  name: string
  password?: string
  role?: string
  image?: string | null
}) {
  const { email, name, password, role, image } = UserCreateSchema.parse(input)

  const user = await createUser({
    email,
    name,
    password: password || undefined,
    role: (role as 'user' | 'admin' | undefined) || undefined
  })

  // Update image if provided
  if (image) {
    const updateData: Record<string, unknown> = { image }
    await updateUser({
      userId: user.user.id,
      data: updateData
    } as any)
  }

  revalidateUsers()

  return {
    success: true,
    message: '用户已创建',
    user
  }
}
