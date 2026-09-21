'use client'

import * as React from 'react'

export type DashboardHeaderContent = {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

const HeaderStateContext = React.createContext<DashboardHeaderContent | null>(
  null
)
const HeaderSetContext = React.createContext<
  (next: DashboardHeaderContent | null) => void
>(() => {})

export function DashboardHeaderProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [header, setHeader] = React.useState<DashboardHeaderContent | null>(
    null
  )

  return (
    <HeaderSetContext.Provider value={setHeader}>
      <HeaderStateContext.Provider value={header}>
        {children}
      </HeaderStateContext.Provider>
    </HeaderSetContext.Provider>
  )
}

export function useDashboardHeader() {
  return React.useContext(HeaderStateContext)
}

export function useSetDashboardHeader() {
  return React.useContext(HeaderSetContext)
}
