'use client'

import { format } from 'date-fns'
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
  queryKnowledgeById,
  getKnowledgeQueryKey
} from '@/modules/knowledges/client'
import PageTitle from '../layout/page-title'
import InfoItem from '../info-item'
import DescriptionItem from '../description-item'
import { Separator } from '../ui/separator'
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
    <div className='flex flex-col gap-6'>
      <PageTitle
        title={knowledge.name}
        description='查看知识库来源、关联范围和索引状态'
        actionButtons={
          <KnowledgeDetailActions
            knowledgeId={knowledge.id}
            knowledgeName={knowledge.name}
          />
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
          <CardDescription>知识库来源、关联范围和维护信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
              <InfoItem label='知识库名称' value={knowledge.name} />
              <InfoItem
                label='来源模式'
                value={
                  <Badge variant='secondary'>
                    {sourceModeLabelMap[knowledge.sourceMode]}
                  </Badge>
                }
              />
              <InfoItem
                label='所属类目'
                value={knowledge.docCate?.name ?? '-'}
              />
              <InfoItem
                label='关联文档数'
                value={knowledge._count.knowledgeDocs}
              />
              <InfoItem label='创建人' value={knowledge.user.name} />
              <InfoItem
                label='创建时间'
                value={format(
                  new Date(knowledge.createdAt),
                  'yyyy-MM-dd HH:mm'
                )}
              />
              <InfoItem
                label='更新时间'
                value={format(
                  new Date(knowledge.updatedAt),
                  'yyyy-MM-dd HH:mm'
                )}
              />
            </div>
            <Separator />
            <DescriptionItem
              label='知识库描述'
              value={knowledge.description ?? '-'}
            />
          </div>
        </CardContent>
      </Card>
      <KnowledgeIndexStatusCard knowledgeId={knowledge.id} />
    </div>
  )
}
