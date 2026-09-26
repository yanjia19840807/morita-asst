import { Pencil } from 'lucide-react'
import Link from 'next/link'

import { UserAccountReadout } from '@/components/auth/user-account-readout'
import { UserSection } from '@/components/auth/user-section'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { buttonVariants } from '@/components/ui/button'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import type { AuthUserDto } from '@/modules/auth/dto'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'
import { UserProfileSummary } from '../profiles/user-profile-summary'

export default async function ProfileDetail({
  user,
  profile
}: {
  user: AuthUserDto
  profile?: UserProfileDetailDto | null
}) {
  return (
    <PageStack>
      <PageTitle
        title='个人资料'
        description={`${user.name} · ${user.email}`}
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              className={buttonVariants({ variant: 'default' })}
              href='/profile/edit'
            >
              <Pencil />
              编辑
            </Link>
          </div>
        }
      />
      <FieldGroup>
        <UserSection>
          <UserAccountReadout user={user} />
        </UserSection>
        {user.role !== 'admin' ? (
          <>
            <FieldSeparator />
            <UserProfileSummary
              userId={user.id}
              profile={profile}
              href='/profile/user-profile#issues'
            />
          </>
        ) : null}
      </FieldGroup>
    </PageStack>
  )
}
