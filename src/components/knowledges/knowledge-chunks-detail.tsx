'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type {
  KnowledgeChunkListItemDto,
  KnowledgeDetailDto
} from '@/modules/knowledges'
import { PageStack } from '../layout/page-stack'
import PageTitle from '../layout/page-title'
import KnowledgeChunkTable from './knowledge-chunk-table'

export function KnowledgeChunksDetail({
  knowledgeId,
  knowledge,
  chunks,
  total,
  pageSize
}: {
  knowledgeId: string
  knowledge: KnowledgeDetailDto
  chunks: KnowledgeChunkListItemDto[]
  total: number
  pageSize: number
}) {
  const averageChunks = knowledge?._count.knowledgeDocs
    ? (total / knowledge._count.knowledgeDocs).toFixed(1)
    : '0.0'

  return (
    <PageStack>
      <PageTitle
        title={knowledge ? `${knowledge.name} / 切片` : '切片浏览'}
        description='查看知识库切分后的文本片段'
        actionButtons={
          <div className='flex items-center gap-2'>
            <Link
              href={`/knowledges/${knowledgeId}`}
              className={buttonVariants({ variant: 'ghost' })}
            >
              返回详情
            </Link>
            <Link
              href='/knowledges'
              className={buttonVariants({ variant: 'ghost' })}
            >
              返回列表
            </Link>
          </div>
        }
      />

      <div className='grid gap-4 md:grid-cols-3 md:gap-6'>
        <Card size='sm'>
          <CardHeader>
            <CardDescription>Chunk总数</CardDescription>
            <CardTitle className='text-2xl'>{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card size='sm'>
          <CardHeader>
            <CardDescription>关联文档数</CardDescription>
            <CardTitle className='text-2xl'>
              {knowledge?._count.knowledgeDocs ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size='sm'>
          <CardHeader>
            <CardDescription>平均每文档Chunk</CardDescription>
            <CardTitle className='text-2xl'>{averageChunks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <KnowledgeChunkTable
        chunks={chunks}
        total={total}
        pageSize={pageSize}
      />
    </PageStack>
  )
}
