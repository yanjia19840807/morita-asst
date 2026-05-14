'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  queryKnowledgeIndexSummary,
  getKnowledgeIndexSummaryQueryKey
} from '@/modules/knowledges/indexing/client'
import FieldDetail from '../field-detail'
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

          <div className='flex flex-row justify-between gap-3'>
            <FieldDetail label='总文档数'>{summary.total}</FieldDetail>
            <FieldDetail label='已完成'>{summary.ready}</FieldDetail>
            <FieldDetail label='处理中'>{summary.processing}</FieldDetail>
            <FieldDetail label='失败'>{summary.failed}</FieldDetail>
          </div>

          <div className='flex flex-row justify-between gap-3'>
            <FieldDetail label='待处理'>{summary.counts.PENDING}</FieldDetail>
            <FieldDetail label='加载中'>{summary.counts.LOADING}</FieldDetail>
            <FieldDetail label='切分中'>{summary.counts.SPLITTING}</FieldDetail>
            <FieldDetail label='嵌入中'>{summary.counts.EMBEDDING}</FieldDetail>
          </div>

          <KnowledgeDocsReadonlyTable knowledgeId={knowledgeId} />
        </div>
      </CardContent>
    </Card>
  )
}
