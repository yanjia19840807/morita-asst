import type { ReactNode } from 'react'

export function TablePanel({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot='table-panel'
      className='overflow-hidden rounded-md border'
    >
      {children}
    </div>
  )
}

export default TablePanel
