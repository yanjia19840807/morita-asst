import { BookOpen, Database, LucideIcon, UserCircle } from 'lucide-react'

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
        url: '/knowledge-base',
        icon: Database,
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
