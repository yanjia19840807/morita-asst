import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import type { AuthUserDto } from '@/modules/auth/dto'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'
import InfoItem from '@/components/info-item'
import PageTitle from '../layout/page-title'
import { UserProfileDetail } from '../profiles/user-profile-detail'

export default async function ProfileDetail({
  user,
  profile
}: {
  user: AuthUserDto
  profile?: UserProfileDetailDto | null
}) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <PageTitle
        title='我的资料'
        description='查看当前账号状态、身份和基础资料'
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
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>当前账号状态、身份和基础资料</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
            <InfoItem
              label='头像'
              value={
                <Avatar>
                  <AvatarImage src={user.image || '/avatar-default.svg'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              }
            />
            <InfoItem
              label='状态'
              value={
                <div className='flex flex-wrap gap-2'>
                  <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                    {user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
                  </Badge>
                  <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                    {user.banned ? '已禁用' : '正常'}
                  </Badge>
                </div>
              }
            />
            <InfoItem label='邮件地址' value={user.email} />
            <InfoItem label='用户名' value={user.name} />
            <InfoItem label='角色' value={user.role} />
            <InfoItem label='禁用原因' value={user.banReason ?? '-'} />
            <InfoItem
              label='禁用截止'
              value={
                user.banExpires
                  ? format(new Date(user.banExpires), 'yyyy/MM/dd HH:mm')
                  : '-'
              }
            />
          </div>
        </CardContent>
      </Card>
      {user.role !== 'admin' && profile ? (
        <UserProfileDetail
          data={profile}
          title='用户画像'
          embedded
          showUserFields={false}
          description='用于补充当前主要困扰、标签和背景信息，帮助后续问答与案例检索更贴近用户情况。'
        />
      ) : null}
    </div>
  )
}
