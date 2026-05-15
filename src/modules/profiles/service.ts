import { NotFoundError, ValidationError } from '@/lib/api/errors'
import { requireAuth, requireRoles } from '@/modules/auth/service'
import { fetchUserById } from '@/modules/auth/service'
import { toUserProfileDetailDto } from './mapper'
import { findUserProfileWithUser, upsertUserProfile } from './repository'
import type { UserProfileDetailDto } from './dto'
import { formatZodError } from '@/lib/zod'
import { userProfileEditSchema, type UserProfileEditValues } from './schemas'

function createEmptyUserProfileDetail(user: {
  id: string
  name: string
  email: string
}) {
  return toUserProfileDetailDto(null, user)
}

export async function fetchMyUserProfile(): Promise<UserProfileDetailDto> {
  const user = await requireAuth()
  if (user.role === 'admin') {
    return createEmptyUserProfileDetail({
      id: user.id,
      name: user.name,
      email: user.email
    })
  }

  const profile = await findUserProfileWithUser(user.id)

  return toUserProfileDetailDto(profile, {
    id: user.id,
    name: user.name,
    email: user.email
  })
}

export async function fetchUserProfileByUserId(
  userId: string
): Promise<UserProfileDetailDto> {
  await requireRoles(['admin'])

  const user = await fetchUserById(userId).catch(() => null)
  if (!user) {
    throw new NotFoundError('用户')
  }

  if (user.role === 'admin') {
    return createEmptyUserProfileDetail({
      id: user.id,
      name: user.name,
      email: user.email
    })
  }

  const profile = await findUserProfileWithUser(userId)

  return toUserProfileDetailDto(profile, {
    id: user.id,
    name: user.name,
    email: user.email
  })
}

function normalizeNullableText(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeIssues(issues: UserProfileEditValues['issues']) {
  return issues.map((issue, index) => ({
    priority: index + 1,
    description: issue.description.trim(),
    tags: issue.tags.map(tag => tag.trim()).filter(Boolean)
  }))
}

export async function saveMyUserProfile(
  data: UserProfileEditValues
): Promise<UserProfileDetailDto> {
  const user = await requireAuth()
  if (user.role === 'admin') {
    return createEmptyUserProfileDetail({
      id: user.id,
      name: user.name,
      email: user.email
    })
  }

  const validation = userProfileEditSchema.safeParse({
    ...data,
    userId: user.id,
    issues: normalizeIssues(data.issues)
  })

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const profile = await upsertUserProfile({
    userId: user.id,
    gender: normalizeNullableText(validation.data.gender),
    ageRange: normalizeNullableText(validation.data.ageRange),
    occupation: normalizeNullableText(validation.data.occupation),
    issues: validation.data.issues
  })

  return toUserProfileDetailDto(profile, {
    id: user.id,
    name: user.name,
    email: user.email
  })
}

export async function saveUserProfileByUserId(
  userId: string,
  data: UserProfileEditValues
): Promise<UserProfileDetailDto> {
  await requireRoles(['admin'])

  const user = await fetchUserById(userId).catch(() => null)
  if (!user) {
    throw new NotFoundError('用户')
  }

  if (user.role === 'admin') {
    return createEmptyUserProfileDetail({
      id: user.id,
      name: user.name,
      email: user.email
    })
  }

  const validation = userProfileEditSchema.safeParse({
    ...data,
    userId,
    issues: normalizeIssues(data.issues)
  })

  if (!validation.success) {
    throw new ValidationError(formatZodError(validation.error))
  }

  const profile = await upsertUserProfile({
    userId,
    gender: normalizeNullableText(validation.data.gender),
    ageRange: normalizeNullableText(validation.data.ageRange),
    occupation: normalizeNullableText(validation.data.occupation),
    issues: validation.data.issues
  })

  return toUserProfileDetailDto(profile, {
    id: user.id,
    name: user.name,
    email: user.email
  })
}
