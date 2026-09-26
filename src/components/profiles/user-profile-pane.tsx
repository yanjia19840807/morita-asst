'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { UserSection } from '@/components/auth/user-section'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import {
  saveMyUserProfileAction,
  saveUserProfileByUserIdAction
} from '@/modules/profiles/actions'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'
import { toUserProfileEditValues } from '@/modules/profiles/mapper'
import type { UserProfileBackgroundValues } from '@/modules/profiles/schemas'
import {
  toIssueDrafts,
  toIssueValues,
  UserIssueList
} from './user-issue-list'
import { UserProfileBackgroundFields } from './user-profile-background-fields'

export const userProfileFormId = 'userProfileForm'

export function UserProfilePane({
  profile,
  mode
}: {
  profile: UserProfileDetailDto
  mode: 'admin' | 'self'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const editValues = toUserProfileEditValues(profile)
  const [issues, setIssues] = useState(() => toIssueDrafts(profile.issues))
  const backgroundForm = useForm<UserProfileBackgroundValues>({
    defaultValues: {
      gender: editValues.gender,
      ageRange: editValues.ageRange,
      occupation: editValues.occupation
    }
  })

  useEffect(() => {
    backgroundForm.reset({
      gender: editValues.gender,
      ageRange: editValues.ageRange,
      occupation: editValues.occupation
    })
    setIssues(toIssueDrafts(profile.issues))
  }, [
    backgroundForm,
    editValues.ageRange,
    editValues.gender,
    editValues.occupation,
    profile.issues
  ])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const background = backgroundForm.getValues()
      const values = {
        ...editValues,
        userId: profile.userId,
        id: profile.id,
        gender: background.gender || null,
        ageRange: background.ageRange || null,
        occupation: background.occupation || null,
        issues: toIssueValues(issues)
      }

      const result =
        mode === 'self'
          ? await saveMyUserProfileAction(values)
          : await saveUserProfileByUserIdAction(profile.userId, values)

      if (result.success) {
        toast.success('画像已保存')
        router.refresh()
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <form id={userProfileFormId} onSubmit={onSubmit}>
      <FieldGroup>
        <UserSection title='背景'>
          <UserProfileBackgroundFields
            form={backgroundForm}
            disabled={isPending}
            showSeparator={false}
            showLegend={false}
          />
        </UserSection>
        <FieldSeparator />
        <UserIssueList
          issues={issues}
          onChange={setIssues}
          disabled={isPending}
        />
      </FieldGroup>
    </form>
  )
}
