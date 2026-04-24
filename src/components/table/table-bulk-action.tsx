import React from 'react'
import { Button } from '../ui/button'

interface TableBulkActionProps extends React.PropsWithChildren {
  isBulkMode: boolean
  handleToggle: () => void
}

export default function TableBulkAction({
  isBulkMode,
  handleToggle,
  children
}: TableBulkActionProps) {
  return (
    <div className='flex flex-row items-center gap-2'>
      {children}
      <Button variant='secondary' onClick={handleToggle}>
        {isBulkMode ? '取消批量操作' : '批量操作'}
      </Button>
    </div>
  )
}
