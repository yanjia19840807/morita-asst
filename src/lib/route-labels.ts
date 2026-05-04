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
