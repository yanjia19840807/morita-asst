import {
  BookOpen,
  Bot,
  Database,
  LucideIcon,
  ScrollText,
  UserCircle
} from 'lucide-react'

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
        url: '/documents',
        icon: BookOpen,
        isActive: false,
        items: []
      },
      {
        title: '知识库',
        url: '/knowledge',
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
