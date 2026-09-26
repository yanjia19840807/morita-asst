import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { UserFieldValue, UserSection } from '@/components/auth/user-section'
import { buttonVariants } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  getAgeRangeLabel,
  getGenderLabel,
  getOccupationLabel
} from '@/modules/profiles/labels'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'

export function UserProfileSummary({
  userId,
  profile,
  href,
  actionLabel
}: {
  userId: string
  profile?: UserProfileDetailDto | null
  href?: string
  actionLabel?: string
}) {
  const nextHref = href ?? `/users/${userId}/user-profile#issues`
  const nextActionLabel = actionLabel ?? '查看完整画像'
  const hasProfile = Boolean(
    profile?.gender ||
      profile?.ageRange ||
      profile?.occupation ||
      profile?.issues.length
  )

  return (
    <UserSection
      title='画像'
      action={
        <Link
          href={nextHref}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          {nextActionLabel}
          <ArrowRight />
        </Link>
      }
    >
      {hasProfile && profile ? (
        <div className='grid gap-5 md:grid-cols-2'>
          <Field>
            <FieldLabel>性别</FieldLabel>
            <UserFieldValue>{getGenderLabel(profile.gender)}</UserFieldValue>
          </Field>
          <Field>
            <FieldLabel>年龄段</FieldLabel>
            <UserFieldValue>
              {getAgeRangeLabel(profile.ageRange)}
            </UserFieldValue>
          </Field>
          <Field>
            <FieldLabel>职业</FieldLabel>
            <UserFieldValue>
              {getOccupationLabel(profile.occupation)}
            </UserFieldValue>
          </Field>
          <Field>
            <FieldLabel>主要问题</FieldLabel>
            <UserFieldValue>{`${profile.issues.length} 条`}</UserFieldValue>
          </Field>
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>
          尚未填写画像，可在画像页补充背景、问题和标签。
        </p>
      )}
    </UserSection>
  )
}
