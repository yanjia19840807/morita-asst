'use client'

import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { TableColumnHeader } from '../table/table-column-header'
import { Checkbox } from '../ui/checkbox'
import { DocCate } from '@/generated/prisma/client'
import RowDragHandle from '../row-drag-handle'

export const docCateColumns: ColumnDef<DocCate>[] = [
  {
    id: 'select',
    size: 80,
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
        disabled={!row.getCanSelect()}
        onCheckedChange={checked => row.toggleSelected(!!checked)}
      />
    )
  },
  {
    id: 'sort',
    size: 80,
    header: '排序',
    cell: ({ row }) => <RowDragHandle disabled={row.original.isDefault} />
  },
  {
    accessorKey: 'name',
    enableSorting: false,
    header: ({ column }) => <TableColumnHeader column={column} title='名称' />,
    cell: ({ row }) => row.original.name
  },
  {
    accessorKey: 'createdAt',
    enableSorting: false,
    header: ({ column }) => (
      <TableColumnHeader column={column} title={'创建时间'} />
    ),
    cell: ({ row }) =>
      format(new Date(row.original.createdAt), 'yyyy/MM/dd HH:mm')
  },
  {
    id: 'actions',
    cell: () => <></>
  }
]
