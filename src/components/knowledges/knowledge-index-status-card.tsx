'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  queryKnowledgeIndexSummary,
  getKnowledgeIndexSummaryQueryKey
} from '@/modules/knowledges/indexing/client'
import InfoItem from '../info-item'
import { Separator } from '../ui/separator'
import { KnowledgeDocsReadonlyTable } from './knowledge-docs-readonly-table'

export function KnowledgeIndexStatusCard({
  knowledgeId
}: {
  knowledgeId: string
}) {
  const summaryQuery = useQuery({
    queryKey: getKnowledgeIndexSummaryQueryKey(knowledgeId),
    queryFn: () => queryKnowledgeIndexSummary(knowledgeId),
    refetchInterval: query =>
      (query.state.data?.processing ?? 0) > 0 ? 3000 : false
  })

  const summary = summaryQuery?.data
  if (!summary) return null

  const completionRate =
    summary.total > 0 ? Math.round((summary.ready / summary.total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>索引状态</CardTitle>
        <CardDescription>文档处理进度和各阶段统计概览</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-3'>
              <div className='text-muted-foreground text-sm'>
                已完成 {summary.ready} / {summary.total}
              </div>
              <Badge variant={summary.failed > 0 ? 'destructive' : 'secondary'}>
                {completionRate}%
              </Badge>
            </div>
            <div className='bg-muted h-2 overflow-hidden rounded-full'>
              <div
                className='bg-primary h-full rounded-full transition-all'
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4'>
            <InfoItem label='总文档数' value={summary.total} />
            <InfoItem label='已完成' value={summary.ready} />
            <InfoItem label='处理中' value={summary.processing} />
            <InfoItem label='失败' value={summary.failed} />
          </div>

          <div className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4'>
            <InfoItem label='待处理' value={summary.counts.PENDING} />
            <InfoItem label='加载中' value={summary.counts.LOADING} />
            <InfoItem label='切分中' value={summary.counts.SPLITTING} />
            <InfoItem label='嵌入中' value={summary.counts.EMBEDDING} />
          </div>

          <Separator />
          <KnowledgeDocsReadonlyTable knowledgeId={knowledgeId} />
        </div>
      </CardContent>
    </Card>
  )
}
