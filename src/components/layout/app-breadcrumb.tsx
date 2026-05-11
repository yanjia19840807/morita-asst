import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { getRouteLabel } from '@/modules/layout'

export default function AppBreadCrumb({ segments }: { segments: string[] }) {
  const crumbs = segments.map((seg, index) => ({
    label: getRouteLabel(seg),
    href: '/' + segments.slice(0, index + 1).join('/')
  }))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>
          <BreadcrumbLink href='/dashboard'>首页</BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbSeparator className='hidden md:block' />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>
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
