'use client'

import { Blocks } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import type {
  KnowledgeChunkListItemDto,
  KnowledgeDetailDto
} from '@/modules/knowledges'
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
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-4'>
      <PageTitle
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
      >
        {knowledge ? `${knowledge.name} / Chunk 浏览` : 'Chunk 浏览'}
      </PageTitle>

      <div className='grid grid-cols-3 gap-3'>
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

      <Card>
        <CardHeader className='border-border/60 gap-3 border-b'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Blocks className='h-4 w-4' />
              Chunk 列表
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <KnowledgeChunkTable
            chunks={chunks}
            total={total}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
    </div>
  )
}
