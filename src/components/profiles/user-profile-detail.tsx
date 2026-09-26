import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { UserFieldValue, UserSection } from '@/components/auth/user-section'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'
import {
  formatIssueTags,
  getAgeRangeLabel,
  getGenderLabel,
  getOccupationLabel
} from '@/modules/profiles/labels'

type UserProfileDetailProps = {
  data: UserProfileDetailDto
  title?: string
  editHref?: string
  backHref?: string
  embedded?: boolean
  showUserFields?: boolean
}

export function UserProfileDetail({
  data,
  title = '用户画像',
  editHref,
  backHref,
  embedded = false,
  showUserFields = true
}: UserProfileDetailProps) {
  const content = (
    <FieldGroup>
      <UserSection title='背景'>
        <div className='grid gap-5 md:grid-cols-2'>
          {showUserFields ? (
            <>
              <Field>
                <FieldLabel>用户名</FieldLabel>
                <UserFieldValue>{data.user.name}</UserFieldValue>
              </Field>
              <Field>
                <FieldLabel>邮箱</FieldLabel>
                <UserFieldValue>{data.user.email}</UserFieldValue>
              </Field>
            </>
          ) : null}
          <Field>
            <FieldLabel>性别</FieldLabel>
            <UserFieldValue>{getGenderLabel(data.gender)}</UserFieldValue>
          </Field>
          <Field>
            <FieldLabel>年龄段</FieldLabel>
            <UserFieldValue>{getAgeRangeLabel(data.ageRange)}</UserFieldValue>
          </Field>
          <Field>
            <FieldLabel>职业</FieldLabel>
            <UserFieldValue>
              {getOccupationLabel(data.occupation)}
            </UserFieldValue>
          </Field>
        </div>
      </UserSection>
      <FieldSeparator />
      <UserSection id='issues' title='主要问题'>
        {data.issues.length ? (
          <div className='flex flex-col gap-5'>
            {data.issues.map(issue => (
              <div key={issue.id} className='grid gap-5 md:grid-cols-2'>
                <Field>
                  <FieldLabel>优先级</FieldLabel>
                  <UserFieldValue>{`P${issue.priority}`}</UserFieldValue>
                </Field>
                <Field>
                  <FieldLabel>标签</FieldLabel>
                  <UserFieldValue>{formatIssueTags(issue.tags)}</UserFieldValue>
                </Field>
                <Field className='md:col-span-2'>
                  <FieldLabel>描述</FieldLabel>
                  <UserFieldValue>{issue.description}</UserFieldValue>
                </Field>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>暂未填写主要问题</p>
        )}
      </UserSection>
    </FieldGroup>
  )

  if (embedded) {
    return content
  }

  return (
    <PageStack>
      <PageTitle
        title={title}
        description='查看用户画像，帮助助手更好地理解来访者'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            {editHref ? (
              <Link
                className={buttonVariants({ variant: 'default' })}
                href={editHref}
              >
                编辑画像
              </Link>
            ) : null}
            {backHref ? (
              <Link
                className={buttonVariants({ variant: 'ghost' })}
                href={backHref}
              >
                返回
              </Link>
            ) : null}
          </div>
        }
      />
      {content}
    </PageStack>
  )
}
