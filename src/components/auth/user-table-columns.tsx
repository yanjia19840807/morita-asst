'use client'

import { ColumnDef } from '@tanstack/react-table'

import Link from 'next/link'
import type { UserRow } from '@/data-access/auth'
import { TableColumnHeader } from '../table/table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { UserTableRowActions } from './user-row-actions'
import { Checkbox } from '../ui/checkbox'

export const userColumns: ColumnDef<UserRow>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={checked => table.toggleAllPageRowsSelected(!!checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={checked => row.toggleSelected(!!checked)}
      />
    )
  },
  {
    accessorKey: 'image',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'头像'} />
    ),
    cell: ({ row }) => (
      <Avatar size='sm'>
        <AvatarImage src={row.original.image || '/avatar-default.svg'} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    )
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'名称'} />
    ),
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original.id}`}
        className='text-primary font-medium underline'
      >
        {row.original.name}
      </Link>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'邮箱地址'} />
    )
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'创建时间'} />
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('zh-CN')
  },
  {
    accessorKey: 'emailVerified',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'是否验证'} />
    ),
    cell: ({ row }) => (row.original.emailVerified ? '是' : '否')
  },
  {
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'角色'} />
    ),
    cell: ({ row }) => row.original.role ?? '-'
  },
  {
    accessorKey: 'banned',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'禁止'} />
    ),
    cell: ({ row }) => (row.original.banned ? '是' : '否')
  },
  {
    accessorKey: 'banReason',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'禁止原因'} />
    ),
    cell: ({ row }) => row.original.banReason ?? '-'
  },
  {
    accessorKey: 'banExpires',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'禁止期限'} />
    ),
    cell: ({ row }) =>
      row.original.banExpires
        ? new Date(row.original.banExpires).toLocaleString('zh-CN')
        : '-'
  },
  {
    id: 'actions',
    cell: ({ row }) => <UserTableRowActions row={row} />
  }
]
