'use client'

import type { KnowledgeRow } from '@/dal/knowledges'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FileText, Fingerprint } from 'lucide-react'
import { Button, buttonVariants } from '../ui/button'

interface KnowledgeCardProps {
  knowledge: KnowledgeRow
}

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
        </div>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col gap-3'>
        <div className='flex items-start gap-2'>
          <Fingerprint className='text-muted-foreground mt-0.5 size-4' />
          <div className='min-w-0'>
            <div className='text-muted-foreground text-xs'>知识库 ID</div>
            <div className='truncate text-xs'>{knowledge.id}</div>
          </div>
        </div>
        <div className='flex items-start gap-2'>
          <FileText className='text-muted-foreground mt-0.5 size-4' />
          <div>
            <div className='text-muted-foreground text-xs'>内容规模</div>
            <div className='font-truncate text-xs'>
              已关联 {knowledge._count.knowledgeDocs} 份文档
            </div>
          </div>
        </div>
        <div className='flex flex-row justify-between'>
          <div>
            <span className='text-muted-foreground text-xs'>创建人</span>
            <span className='font-truncate ml-1 text-xs'>
              {knowledge.user.name}
            </span>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>创建时间</span>
            <span className='font-truncate ml-1 text-xs'>
              {format(new Date(knowledge.createdAt), 'yyyy/MM/dd')}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex-row border-t'>
        <Button variant='ghost' size='sm' className='flex-1' asChild>
          <Link
            href={`/knowledges/${knowledge.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            编辑
          </Link>
        </Button>
        <Button variant='ghost' size='sm' className='flex-1' asChild>
          <Link
            href={`/knowledges/${knowledge.id}`}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            查看
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
