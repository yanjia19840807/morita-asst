import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type ListUsersOptions = NonNullable<Parameters<typeof auth.api.listUsers>[0]>
type GetUserOptions = NonNullable<Parameters<typeof auth.api.getUser>[0]>
type AdminUpdateUserOptions = NonNullable<
  Parameters<typeof auth.api.adminUpdateUser>[0]
>
type CreateUserOptions = NonNullable<Parameters<typeof auth.api.createUser>[0]>
type BanUserOptions = NonNullable<Parameters<typeof auth.api.banUser>[0]>
type UnbanUserOptions = NonNullable<Parameters<typeof auth.api.unbanUser>[0]>
type RemoveUserOptions = NonNullable<Parameters<typeof auth.api.removeUser>[0]>

export type FetchUsersQuery = ListUsersOptions['query']
export type FetchUsersResult = Awaited<ReturnType<typeof auth.api.listUsers>>
export type FetchUserByIdQuery = GetUserOptions['query']
export type FetchUserByIdResult = Awaited<ReturnType<typeof auth.api.getUser>>
export type UserRow = FetchUsersResult['users'][number]
export type UpdateUserInput = AdminUpdateUserOptions['body']
export type CreateUserInput = CreateUserOptions['body']
export type BanUserInput = BanUserOptions['body']
export type UnbanUserInput = UnbanUserOptions['body']
export type RemoveUserInput = RemoveUserOptions['body']
export type FetchProfileResult = Awaited<ReturnType<typeof auth.api.getSession>>

async function getRequestHeaders() {
  return await headers()
}

export async function fetchProfile() {
  return auth.api.getSession({
    headers: await getRequestHeaders()
  })
}

export async function fetchUsers(query: FetchUsersQuery = {}) {
  return auth.api.listUsers({
    query,
    headers: await getRequestHeaders()
  })
}

export async function fetchUserById(id: FetchUserByIdQuery['id']) {
  return auth.api.getUser({
    query: { id },
    headers: await getRequestHeaders()
  })
}

export async function createUser(input: CreateUserInput) {
  return auth.api.createUser({
    body: input,
    headers: await getRequestHeaders()
  })
}

export async function updateUser(input: UpdateUserInput) {
  return auth.api.adminUpdateUser({
    body: input,
    headers: await getRequestHeaders()
  })
}

export async function banUser(input: BanUserInput) {
  return auth.api.banUser({
    body: input,
    headers: await getRequestHeaders()
  })
}

export async function unbanUser(input: UnbanUserInput) {
  return auth.api.unbanUser({
    body: input,
    headers: await getRequestHeaders()
  })
}

export async function removeUser(input: RemoveUserInput) {
  return auth.api.removeUser({
    body: input,
    headers: await getRequestHeaders()
  })
}

export async function setUserPassword(input: {
  userId: string
  newPassword: string
}) {
  return auth.api.setUserPassword({
    body: input,
    headers: await getRequestHeaders()
  })
}
