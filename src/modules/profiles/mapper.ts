import type { Prisma } from '@/generated/prisma/client'
import type { UserProfileDetailDto, UserIssueDto } from './dto'
import type { UserProfileEditValues } from './schemas'

type UserProfileRecord = Prisma.UserProfileGetPayload<{
  include: {
    user: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    issues: {
      orderBy: {
        priority: 'asc'
      }
    }
  }
}>

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
}

function toUserIssueDto(
  issue: UserProfileRecord['issues'][number]
): UserIssueDto {
  return {
    id: issue.id,
    priority: issue.priority,
    tags: toStringArray(issue.tags),
    description: issue.description
  }
}

export function toUserProfileDetailDto(
  profile: UserProfileRecord | null,
  user: {
    id: string
    name: string
    email: string
  }
): UserProfileDetailDto {
  return {
    id: profile?.id ?? null,
    userId: user.id,
    gender: profile?.gender ?? null,
    ageRange: profile?.ageRange ?? null,
    occupation: profile?.occupation ?? null,
    issues: profile?.issues.map(toUserIssueDto) ?? [],
    createdAt: profile?.createdAt.toISOString() ?? null,
    updatedAt: profile?.updatedAt.toISOString() ?? null,
    user
  }
}

export function toUserProfileEditValues(
  profile: UserProfileDetailDto
): UserProfileEditValues {
  return {
    id: profile.id,
    userId: profile.userId,
    gender: profile.gender,
    ageRange: profile.ageRange,
    occupation: profile.occupation,
    issues: profile.issues.map(issue => ({
      id: issue.id,
      priority: issue.priority,
      tags: issue.tags,
      description: issue.description
    }))
  }
}
