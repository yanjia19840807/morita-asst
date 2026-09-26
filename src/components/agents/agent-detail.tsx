import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronLeft, Edit, MessageSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { PagePanel } from '@/components/layout/page-panel'
import { PageStack } from '@/components/layout/page-stack'
import InfoItem from '@/components/info-item'
import PageTitle from '@/components/layout/page-title'
import type { AgentRow } from '@/modules/agents/service'

const statusMap = {
  DRAFT: '草稿',
  ACTIVE: '启用中',
  DISABLED: '已停用'
} as const

export function AgentDetail({ agent }: { agent: AgentRow }) {
  return (
    <PageStack>
      <PageTitle
        title={agent.name}
        description='查看助手配置、绑定资源和运行状态'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            {agent.status === 'ACTIVE' ? (
              <Link
                href={`/agents/${agent.id}/chat`}
                className={buttonVariants()}
              >
                <MessageSquare />
                对话
              </Link>
            ) : (
              <span
                className={buttonVariants({ className: 'pointer-events-none opacity-50' })}
                title='仅启用中的助手可以试聊'
              >
                <MessageSquare />
                对话
              </span>
            )}
            <Link
              href={`/agents/${agent.id}/edit`}
              className={buttonVariants({ variant: 'outline' })}
            >
              <Edit />
              编辑
            </Link>
            <Link
              href='/agents'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />
      <PagePanel title='基础信息' description='助手身份和运行状态'>
        <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
          <InfoItem label='名称' value={agent.name} />
          <InfoItem
            label='状态'
            value={<Badge variant='secondary'>{statusMap[agent.status]}</Badge>}
          />
          <InfoItem label='描述' value={agent.description || '暂无描述'} />
          <InfoItem
            label='创建时间'
            value={format(new Date(agent.createdAt), 'yyyy-MM-dd HH:mm')}
          />
          <InfoItem
            label='更新时间'
            value={format(new Date(agent.updatedAt), 'yyyy-MM-dd HH:mm')}
          />
        </div>
      </PagePanel>
      <PagePanel title='能力配置' description='绑定的模型、提示词和知识库'>
        <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
          <InfoItem label='模型' value={agent.model || '未设置模型'} />
          <InfoItem label='温度' value={String(agent.temperature)} />
          <InfoItem label='历史条数' value={String(agent.historyLimit)} />
          <InfoItem label='检索条数' value={String(agent.retrieveTopK)} />
          <InfoItem
            label='提示词'
            value={agent.promptProfile?.name || '未绑定提示词'}
          />
          <InfoItem
            label='知识库'
            value={agent.knowledge?.name || '未绑定知识库'}
          />
        </div>
      </PagePanel>
    </PageStack>
  )
}
