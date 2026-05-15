import { Prisma } from '@/generated/prisma/client'
import { ValidationError } from '@/lib/api/errors'
import { prisma } from '@/lib/prisma'

function isMissingProfileTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021'
  )
}

export async function findUserProfileWithUser(userId: string) {
  try {
    return await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        issues: {
          orderBy: {
            priority: 'asc'
          }
        }
      }
    })
  } catch (error) {
    if (isMissingProfileTableError(error)) {
      return null
    }

    throw error
  }
}

type UpsertUserProfileInput = {
  userId: string
  gender?: string | null
  ageRange?: string | null
  occupation?: string | null
  issues: {
    priority: number
    tags: string[]
    description: string
  }[]
}

export async function upsertUserProfile(input: UpsertUserProfileInput) {
  const { userId, gender, ageRange, occupation, issues } = input

  try {
    return await prisma.$transaction(async tx => {
      const profile = await tx.userProfile.upsert({
        where: { userId },
        update: {
          gender,
          ageRange,
          occupation
        },
        create: {
          userId,
          gender,
          ageRange,
          occupation
        }
      })

      await tx.userIssue.deleteMany({
        where: {
          userProfileId: profile.id
        }
      })

      if (issues.length) {
        await tx.userIssue.createMany({
          data: issues.map(issue => ({
            userProfileId: profile.id,
            priority: issue.priority,
            tags: issue.tags,
            description: issue.description
          }))
        })
      }

      return tx.userProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          issues: {
            orderBy: {
              priority: 'asc'
            }
          }
        }
      })
    })
  } catch (error) {
    if (isMissingProfileTableError(error)) {
      throw new ValidationError('用户画像数据表尚未创建，请先执行数据库迁移')
    }

    throw error
  }
}
