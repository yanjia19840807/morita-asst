'use client'

import Link from 'next/link'
import { Row } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import {
  removeUserAction,
  banUserAction,
  unbanUserAction
} from '@/modules/auth/actions'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import type { AuthUserDto } from '@/modules/auth/dto'

interface UserTableRowActionsProps {
  row: Row<AuthUserDto>
}

export function UserTableRowActions({ row }: UserTableRowActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const user = row.original

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
        } else {
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
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await removeUserAction(user.id)
        if (result.success) {
          toast.success('用户已删除')
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
    <div className='flex items-center justify-end gap-2 whitespace-nowrap'>
      <Button
        asChild
        size='sm'
        variant='ghost'
        className={isPending ? 'pointer-events-none opacity-50' : undefined}
      >
        <Link href={`/users/${user.id}/edit`}>
          <span>编辑</span>
        </Link>
      </Button>
      <Button
        size='sm'
        variant='ghost'
        disabled={isPending}
        onClick={handleToggleBan}
      >
        {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
        <span>{user.banned ? '启用' : '禁用'}</span>
      </Button>
      <ConfirmDialog
        title='删除用户'
        description={`确认删除用户"${user.name}"吗？此操作不可撤销。`}
        actions={{
          label: '删除',
          onClick: handleRemove,
          className:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        }}
      >
        <Button size='sm' variant='destructive' disabled={isPending}>
          {isPending && <Loader2 className='h-4 w-4 animate-spin' />}
          <span>删除</span>
        </Button>
      </ConfirmDialog>
    </div>
  )
}
