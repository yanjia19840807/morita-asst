import AppBreadCrumb from '@/components/layout/app-breadcrumb'

export default async function BreadcrumbsSlot({
  params
}: {
  params: Promise<{ all: string[] }>
}) {
  const { all } = await params
  return <AppBreadCrumb segments={all} />
}
