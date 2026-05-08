import React from 'react'

export default function PageActionBar({ children }: React.PropsWithChildren) {
  return (
    <div className='my-4 flex items-center justify-end gap-2'>{children}</div>
  )
}
