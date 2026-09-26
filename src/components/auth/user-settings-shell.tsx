import type { ReactNode } from 'react'

import { PageSplit } from '@/components/layout/page-split'
import { PageStack } from '@/components/layout/page-stack'
import type { AuthUserDto } from '@/modules/auth/dto'
import { UserSettingsHeader } from './user-settings-header'
import { UserSettingsNav } from './user-settings-nav'

export function UserSettingsShell({
  user,
  children
}: {
  user?: AuthUserDto
  children: ReactNode
}) {
  return (
    <PageStack>
      <UserSettingsHeader user={user} />
      <PageSplit
        aside={
          <UserSettingsNav
            userId={user?.id}
            showProfile={user ? user.role !== 'admin' : true}
            disabledSections={user ? [] : ['security', 'profile']}
          />
        }
      >
        {children}
      </PageSplit>
    </PageStack>
  )
}
