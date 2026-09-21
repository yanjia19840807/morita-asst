'use client'

import * as React from 'react'
import type { ReactNode } from 'react'
import { useSetDashboardHeader } from '@/components/layout/page-header-context'

interface PageHeaderProps {
  title?: ReactNode
  description?: ReactNode
  actions?: React.ReactNode
  actionButtons?: React.ReactNode
  children?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  actionButtons,
  children
}: PageHeaderProps) {
  const heading = title ?? children
  const right = actions ?? actionButtons
  const setHeader = useSetDashboardHeader()

  React.useLayoutEffect(() => {
    setHeader({
      title: heading,
      description,
      actions: right
    })
  }, [description, heading, right, setHeader])

  React.useLayoutEffect(() => {
    return () => setHeader(null)
  }, [setHeader])

  return null
}

export { PageHeader as PageTitle }
export default PageHeader
