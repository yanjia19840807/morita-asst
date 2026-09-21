export const CHAT_MODEL_OPTIONS = [
  { value: 'deepseek-flash', label: 'DeepSeek Flash' },
  { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' }
] as const

export const CHAT_MODEL_VALUES = CHAT_MODEL_OPTIONS.map(
  option => option.value
) as unknown as [
  (typeof CHAT_MODEL_OPTIONS)[number]['value'],
  ...(typeof CHAT_MODEL_OPTIONS)[number]['value'][]
]

export const DEFAULT_CHAT_MODEL = 'deepseek-flash'

export type ChatModelValue = (typeof CHAT_MODEL_OPTIONS)[number]['value']

export function resolveChatModel(model?: string | null): ChatModelValue {
  const normalized = model?.trim()
  return CHAT_MODEL_OPTIONS.some(option => option.value === normalized)
    ? (normalized as ChatModelValue)
    : DEFAULT_CHAT_MODEL
}
