import { format } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import PageTitle from '../layout/page-title'
import type { KnowledgeDetailRow } from '@/dal/knowledges'
import { KNOWLEDGE_SOURCE_MODE } from '@/schemas/knowledge'
import DetailItem from '../data-item'
import { KnowledgeDocumentsTable } from './knowledge-documents-table'

interface KnowledgeDetailProps {
  knowledge: KnowledgeDetailRow
}

const sourceModeLabelMap = {
  [KNOWLEDGE_SOURCE_MODE.DOC_CATE]: '按类目关联',
  [KNOWLEDGE_SOURCE_MODE.DOC]: '按文件关联'
} as const

export function KnowledgeDetail({ knowledge }: KnowledgeDetailProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              href='/knowledge'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        {knowledge.name}
      </PageTitle>

      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <DetailItem label='知识库名称'>{knowledge.name}</DetailItem>
            <DetailItem label='知识库描述'>
              {knowledge.description ?? '-'}
            </DetailItem>
            <DetailItem label='来源模式'>
              <Badge variant='secondary'>
                {sourceModeLabelMap[knowledge.sourceMode]}
              </Badge>
            </DetailItem>
            <div className='flex flex-row justify-between gap-3'>
              <DetailItem label='所属类目'>
                {knowledge.category?.name ?? '-'}
              </DetailItem>
              <DetailItem label='关联文档数'>
                {knowledge._count.documents} 份文档
              </DetailItem>
            </div>
            <div className='flex flex-row justify-between gap-3'>
              <DetailItem label='创建人'>{knowledge.user.name}</DetailItem>
              <DetailItem label='创建时间'>
                {format(new Date(knowledge.createdAt), 'yyyy/MM/dd HH:mm')}
              </DetailItem>
              <DetailItem label='更新时间'>
                {format(new Date(knowledge.updatedAt), 'yyyy/MM/dd HH:mm')}
              </DetailItem>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>关联文档</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeDocumentsTable knowledgeId={knowledge.id} />
        </CardContent>
      </Card>
    </div>
  )
}
