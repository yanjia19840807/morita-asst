'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Ban, LoaderCircle } from 'lucide-react'

import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { banUserAction, unbanUserAction } from '@/modules/auth/actions'
import type { AuthUserDto } from '@/modules/auth/dto'

export function UserBanButton({ user }: { user: AuthUserDto }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleToggleBan = () => {
    startTransition(async () => {
      try {
        if (user.banned) {
          const result = await unbanUserAction(user.id)
          if (result.success) {
            toast.success('用户已启用')
            router.refresh()
          } else {
            toast.error(result.error.message)
          }
          return
        }

        const result = await banUserAction({
          id: user.id,
          banReason: user.banReason || '管理员禁用'
        })

        if (result.success) {
          toast.success('用户已禁用')
          router.refresh()
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  return (
    <ConfirmDialog
      title={user.banned ? '启用用户' : '禁用用户'}
      description={
        user.banned
          ? `确认启用用户“${user.name}”吗？`
          : `确认禁用用户“${user.name}”吗？禁用后该账号将无法登录。`
      }
      actions={{
        label: user.banned ? '启用' : '禁用',
        onClick: handleToggleBan
      }}
    >
      <Button
        type='button'
        variant={user.banned ? 'outline' : 'destructive'}
        disabled={isPending}
      >
        {isPending ? <LoaderCircle className='animate-spin' /> : <Ban />}
        {user.banned ? '启用' : '禁用'}
      </Button>
    </ConfirmDialog>
  )
}
