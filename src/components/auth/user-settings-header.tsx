'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, Edit, Save } from 'lucide-react'

import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import type { AuthUserDto } from '@/modules/auth/dto'
import { UserBanButton } from './user-ban-button'

function getPageTitle(pathname: string, userId: string) {
  if (pathname === `/users/${userId}/security`) {
    return '安全'
  }

  if (pathname.startsWith(`/users/${userId}/user-profile`)) {
    return '画像'
  }

  if (pathname === `/users/${userId}/edit`) {
    return '编辑用户'
  }

  return '账号资料'
}

export function UserSettingsHeader({ user }: { user?: AuthUserDto }) {
  const pathname = usePathname()
  const title = user ? getPageTitle(pathname, user.id) : '新增用户'
  const isCreate = !user
  const isView = Boolean(user && pathname === `/users/${user.id}`)
  const isEdit = Boolean(user && pathname === `/users/${user.id}/edit`)
  const isSecurity = Boolean(user && pathname === `/users/${user.id}/security`)
  const isProfile = Boolean(
    user && pathname.startsWith(`/users/${user.id}/user-profile`)
  )

  return (
    <PageTitle
      title={title}
      description={
        user ? `${user.name} · ${user.email}` : '创建账号并设置角色'
      }
      actionButtons={
        <div className='flex flex-row items-center gap-2'>
          {user && isView ? (
            <Link
              href={`/users/${user.id}/edit`}
              className={buttonVariants()}
            >
              <Edit />
              编辑
            </Link>
          ) : null}
          {isCreate ? (
            <Button type='submit' form='userCreateForm'>
              <Save />
              保存
            </Button>
          ) : null}
          {isEdit ? (
            <Button type='submit' form='userEditForm'>
              <Save />
              保存
            </Button>
          ) : null}
          {isSecurity ? (
            <Button type='submit' form='userSecurityForm'>
              <Save />
              更新密码
            </Button>
          ) : null}
          {isProfile ? (
            <Button type='submit' form='userProfileForm'>
              <Save />
              保存
            </Button>
          ) : null}
          {user ? <UserBanButton user={user} /> : null}
          <Link
            href='/users'
            className={buttonVariants({
              variant: 'ghost'
            })}
          >
            <ChevronLeft />
            返回
          </Link>
        </div>
      }
    />
  )
}
