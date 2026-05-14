'use client'

import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  queryKnowledgeById,
  getKnowledgeQueryKey
} from '@/modules/knowledges/client'
import PageTitle from '../layout/page-title'
import FieldDetail from '../field-detail'
import { KnowledgeDetailActions } from './knowledge-detail-actions'
import { KnowledgeIndexStatusCard } from './knowledge-index-status-card'
import { KNOWLEDGE_SOURCE_MODE } from '@/modules/knowledges/schemas'

const sourceModeLabelMap = {
  [KNOWLEDGE_SOURCE_MODE.DOC_CATE]: '按类目关联',
  [KNOWLEDGE_SOURCE_MODE.DOC]: '按文件关联'
} as const

export function KnowledgeDetail({ knowledgeId }: { knowledgeId: string }) {
  const knowledgeQuery = useQuery({
    queryKey: getKnowledgeQueryKey(knowledgeId),
    queryFn: () => queryKnowledgeById(knowledgeId)
  })

  const knowledge = knowledgeQuery?.data
  if (!knowledge) return null

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={<KnowledgeDetailActions knowledgeId={knowledge.id} />}
      >
        {knowledge.name}
      </PageTitle>
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-row justify-between gap-3'>
              <FieldDetail label='知识库名称'>{knowledge.name}</FieldDetail>
              <FieldDetail label='来源模式'>
                <Badge variant='secondary'>
                  {sourceModeLabelMap[knowledge.sourceMode]}
                </Badge>
              </FieldDetail>
            </div>
            <FieldDetail label='知识库描述'>
              {knowledge.description ?? '-'}
            </FieldDetail>
            <div className='flex flex-row justify-between gap-3'>
              <FieldDetail label='所属类目'>
                {knowledge.docCate?.name ?? '-'}
              </FieldDetail>
              <FieldDetail label='关联文档数'>
                {knowledge._count.knowledgeDocs}
              </FieldDetail>
            </div>
            <div className='flex flex-row justify-between gap-3'>
              <FieldDetail label='创建人'>{knowledge.user.name}</FieldDetail>
              <FieldDetail label='创建时间'>
                {format(new Date(knowledge.createdAt), 'yyyy-MM-dd HH:mm')}
              </FieldDetail>
            </div>
            <div className='flex flex-row justify-between gap-3'>
              <FieldDetail label='更新时间'>
                {format(new Date(knowledge.updatedAt), 'yyyy-MM-dd HH:mm')}
              </FieldDetail>
            </div>
          </div>
        </CardContent>
      </Card>
      <KnowledgeIndexStatusCard knowledgeId={knowledge.id} />
    </div>
  )
}
