import Link from 'next/link'
import { Save } from 'lucide-react'

import { UserProfilePane, userProfileFormId } from '@/components/profiles/user-profile-pane'
import { PageShell } from '@/components/layout/page-shell'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { fetchMyUserProfile } from '@/modules/profiles/service'

export default async function MyUserProfilePage() {
  const profile = await fetchMyUserProfile()

  return (
    <PageShell>
      <PageStack>
        <PageTitle
          title='我的画像'
          description='维护背景信息和主要问题'
          actionButtons={
            <div className='flex flex-row items-center gap-2'>
              <Button type='submit' form={userProfileFormId}>
                <Save />
                保存
              </Button>
              <Link
                href='/profile'
                className={buttonVariants({ variant: 'ghost' })}
              >
                返回
              </Link>
            </div>
          }
        />
        <UserProfilePane profile={profile} mode='self' />
      </PageStack>
    </PageShell>
  )
}
