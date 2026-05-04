'use client'

import type { KnowledgeRow } from '@/data-access/knowledge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { CalendarDays, FileText, Fingerprint } from 'lucide-react'

interface KnowledgeCardProps {
  knowledge: KnowledgeRow
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

export default function KnowledgeCard({ knowledge }: KnowledgeCardProps) {
  return (
    <Card className='border-border/70 bg-card/80 flex h-full flex-col shadow-sm'>
      <CardHeader className='gap-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <CardTitle className='line-clamp-1 text-base'>
              {knowledge.name}
            </CardTitle>
            <CardDescription className='line-clamp-3 text-sm leading-6'>
              {knowledge.description || '暂无描述'}
            </CardDescription>
          </div>
          <div className='bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-xs font-medium'>
            {knowledge._count.documents} 个文档
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-3'>
        <div className='bg-muted/30 grid gap-3 rounded-xl border p-3 text-sm'>
          <div className='flex items-start gap-3'>
            <Fingerprint className='text-muted-foreground mt-0.5 size-4' />
            <div className='min-w-0'>
              <div className='text-muted-foreground text-xs'>知识库 ID</div>
              <div className='truncate font-mono text-xs'>{knowledge.id}</div>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <FileText className='text-muted-foreground mt-0.5 size-4' />
            <div>
              <div className='text-muted-foreground text-xs'>内容规模</div>
              <div className='font-medium'>
                已关联 {knowledge._count.documents} 份文档
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='text-muted-foreground mt-auto justify-between border-t pt-4 text-xs'>
        <div className='flex items-center gap-2'>
          <CalendarDays className='size-4' />
          <span>创建于 {dateFormatter.format(knowledge.createdAt)}</span>
        </div>
        <span>更新于 {dateFormatter.format(knowledge.updatedAt)}</span>
      </CardFooter>
    </Card>
  )
}
