'use client'

import type { AgentRowDto } from '@/modules/agents/dto'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '../ui/button'

interface AgentCardProps {
  agent: AgentRowDto
}

const statusMap = {
  DRAFT: {
    label: '草稿',
    className: 'bg-muted text-muted-foreground'
  },
  ACTIVE: {
    label: '启用中',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
  },
  DISABLED: {
    label: '已停用',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
  }
} as const

export default function AgentCard({ agent }: AgentCardProps) {
  const status = statusMap[agent.status]

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader>
        <CardTitle className='w-full truncate'>{agent.name}</CardTitle>
        <CardDescription className='flex items-center gap-1'></CardDescription>
        <CardAction>
          <div
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex flex-row items-center gap-2'>
          <div className='text-muted-foreground text-xs'>ID</div>
          <div className='w-full truncate'>{agent.id}</div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='flex flex-col'>
            <div className='text-muted-foreground text-xs'>提示词</div>
            <div className='w-full truncate font-medium'>
              {agent.promptProfile?.name || '未绑定提示词'}
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='text-muted-foreground text-xs'>知识库</div>
            <div className='w-full truncate font-medium'>
              {agent.knowledge?.name || '未绑定知识库'}
            </div>
          </div>
        </div>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='flex flex-col'>
            <div className='text-muted-foreground text-xs'>模型</div>
            <div className='w-full truncate font-medium'>
              {agent.model || '未设置模型'}
            </div>
          </div>
          <div className='flex flex-col'>
            <div className='text-muted-foreground text-xs'>运行状态</div>
            <div className='w-full truncate font-medium'>{status.label}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className='gap-2'>
        <Button
          variant='ghost'
          size='sm'
          className='flex-1'
          nativeButton={false}
          render={<Link href={`/agents/${agent.id}/edit`} />}
        >
          编辑
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='flex-1'
          nativeButton={false}
          render={<Link href={`/agents/${agent.id}`} />}
        >
          查看
        </Button>
        {agent.status === 'ACTIVE' ? (
          <Button
            variant='ghost'
            size='sm'
            className='flex-1'
            nativeButton={false}
            render={<Link href={`/agents/${agent.id}/chat`} />}
          >
            对话
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='flex-1'
            disabled
            title='仅启用中的助手可以试聊'
          >
            对话
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
