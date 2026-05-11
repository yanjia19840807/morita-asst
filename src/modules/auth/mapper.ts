import { auth } from './server'
import type {
  ProfileEditFormValues,
  UserEditFormValues,
  UserFormValues
} from './schemas'
import type { AuthSessionDto, AuthUserDto, AuthUsersListDto } from './dto'

type RawUsersResult = Awaited<ReturnType<typeof auth.api.listUsers>>
type RawUserRow = RawUsersResult['users'][number]
type RawSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
type RawSessionUser = RawSession['user']
type RawUserDetail = NonNullable<Awaited<ReturnType<typeof auth.api.getUser>>>

function toDateOrNull(value: unknown): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const date = new Date(value as string | number)
  return Number.isNaN(date.getTime()) ? null : date
}

function toAuthUserBaseDto(user: {
  id?: string | null
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string | null
  emailVerified?: boolean | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: unknown
  createdAt?: unknown
}): AuthUserDto {
  return {
    id: user.id ?? '',
    email: user.email ?? '',
    name: user.name ?? '',
    image: user.image ?? null,
    role: user.role ?? null,
    emailVerified: Boolean(user.emailVerified),
    banned: Boolean(user.banned),
    banReason: user.banReason ?? null,
    banExpires: toDateOrNull(user.banExpires),
    createdAt: toDateOrNull(user.createdAt)
  }
}

export function toAuthUserDto(user: RawUserRow | RawUserDetail): AuthUserDto {
  return toAuthUserBaseDto(user)
}

export function toAuthSessionUserDto(user: RawSessionUser): AuthUserDto {
  return toAuthUserBaseDto(user)
}

export function toAuthSessionDto(session: RawSession): AuthSessionDto {
  return {
    user: toAuthSessionUserDto(session.user)
  }
}

export function toAuthUsersListDto(result: RawUsersResult): AuthUsersListDto {
  return {
    users: result.users.map(toAuthUserDto),
    total: result.total
  }
}

export function toUserFormValues(user: AuthUserDto): UserFormValues {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role === 'admin' ? 'admin' : 'user',
    emailVerified: user.emailVerified,
    banned: user.banned,
    banReason: user.banReason ?? undefined,
    banExpires: user.banExpires ?? undefined,
    password: undefined
  }
}

export function toUserEditFormValues(user: AuthUserDto): UserEditFormValues {
  return toUserFormValues(user)
}

export function toProfileEditFormValues(
  user: AuthUserDto
): ProfileEditFormValues & { id: string } {
  return {
    id: user.id,
    name: user.name,
    image: user.image
  }
}
