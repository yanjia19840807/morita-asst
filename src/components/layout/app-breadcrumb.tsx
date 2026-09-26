import React from 'react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { getRouteLabel } from '@/modules/layout'

export function getPathnameSegments(pathname: string) {
  return pathname.split('/').filter(Boolean)
}

export default function AppBreadCrumb({ segments }: { segments: string[] }) {
  if (segments.length === 0) {
    return null
  }

  const crumbs = segments.map((seg, index) => ({
    label: getRouteLabel(seg),
    href: '/' + segments.slice(0, index + 1).join('/')
  }))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href='/agents' />}>首页</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
