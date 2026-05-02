'use client'

import Link from 'next/link'
import { Row } from '@tanstack/react-table'
import {
  Ban,
  Ellipsis,
  Loader2,
  Pencil,
  ShieldCheck,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import {
  removeUserAction,
  banUserAction,
  unbanUserAction
} from '@/app/(auth)/actions'
import ConfirmDialog from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { UserRow } from '@/data-access/auth'

interface UserTableRowActionsProps {
  row: Row<UserRow>
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Ellipsis />
          )}
          <span className='sr-only'>Open Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Pencil />
            <span>编辑</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending}
          onSelect={event => {
            event.preventDefault()
            handleToggleBan()
          }}
        >
          {user.banned ? <ShieldCheck /> : <Ban />}
          <span>{user.banned ? '启用' : '禁用'}</span>
        </DropdownMenuItem>
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
          <DropdownMenuItem
            disabled={isPending}
            variant='destructive'
            onSelect={event => event.preventDefault()}
          >
            <Trash2 />
            <span>删除</span>
          </DropdownMenuItem>
        </ConfirmDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
