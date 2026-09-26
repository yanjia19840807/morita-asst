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
  agents: '助手',
  docs: '文档',
  documents: '文档',
  knowledges: '知识库',
  knowledge: '知识库',
  'prompt-profiles': '提示词',
  'user-profile': '画像',
  users: '用户',
  new: '新增',
  edit: '编辑',
  security: '安全',
  chat: '对话',
  categories: '类目',
  chunks: '切片',
  profile: '个人资料',
  bookmarks: '书签',
  settings: '设置'
}

const idSegmentPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function getRouteLabel(segment: string): string {
  const key = segment.toLowerCase()
  if (routeLabels[key]) {
    return routeLabels[key]
  }

  return idSegmentPattern.test(segment) ? '详情' : segment
}

export type MainNavItem = {
  title: string
  url: string
}

export const mainNavItems: MainNavItem[] = [
  { title: '助手', url: '/agents' },
  { title: '文档', url: '/docs' },
  { title: '知识库', url: '/knowledges' },
  { title: '提示词', url: '/prompt-profiles' },
  { title: '用户', url: '/users' }
]

export function isNavActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
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

const navIcons: Record<string, LucideIcon> = {
  '/agents': Bot,
  '/docs': BookOpen,
  '/knowledges': Database,
  '/prompt-profiles': ScrollText,
  '/users': UserCircle
}

export const menuConfig: MenuConfig = [
  {
    label: '功能',
    items: mainNavItems.map(item => ({
      title: item.title,
      url: item.url,
      icon: navIcons[item.url],
      isActive: false,
      items: []
    }))
  }
]
