import {
  BookOpen,
  Bot,
  Database,
  LucideIcon,
  ScrollText,
  UserCircle
} from 'lucide-react'

export const routeLabels: Record<string, string> = {
  dashboard: '仪表盘',
  agents: '助手管理',
  documents: '文档数据',
  knowledge: '知识库',
  'prompt-profiles': '提示词管理',
  users: '用户',
  new: '新增',
  profile: '个人资料',
  bookmarks: '书签',
  settings: '设置'
}

export function getRouteLabel(segment: string): string {
  return routeLabels[segment.toLowerCase()] ?? segment
}

export type MenuConfig = {
  label: string
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: { title: string; url: string }[]
  }[]
}[]

export const menuConfig: MenuConfig = [
  {
    label: '智能',
    items: [
      {
        title: '助手管理',
        url: '/agents',
        icon: Bot,
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '数据',
    items: [
      {
        title: '文档数据',
        url: '/docs',
        icon: BookOpen,
        isActive: false,
        items: []
      },
      {
        title: '知识库',
        url: '/knowledges',
        icon: Database,
        isActive: false,
        items: []
      },
      {
        title: '提示词管理',
        url: '/prompt-profiles',
        icon: ScrollText,
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '访问',
    items: [
      {
        title: '用户',
        url: '/users',
        icon: UserCircle,
        isActive: false
      }
    ]
  }
]
