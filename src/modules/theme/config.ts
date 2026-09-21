export const themeModes = ['light', 'dark', 'system'] as const

export type ThemeMode = (typeof themeModes)[number]

export const themePresets = ['yun', 'moss', 'neutral'] as const

export type ThemePreset = (typeof themePresets)[number]

export const themePresetMeta: Record<
  ThemePreset,
  { label: string; description: string; swatch: string }
> = {
  yun: {
    label: '云天',
    description: 'Tailwind Admin 默认蓝',
    swatch: '#5d87ff'
  },
  moss: {
    label: '青苔',
    description: '成功绿，更贴近自然',
    swatch: '#13deb9'
  },
  neutral: {
    label: '素灰',
    description: '中性深色',
    swatch: '#2a3547'
  }
}

export const themeConfig = {
  defaultMode: 'system' as ThemeMode,
  defaultPreset: 'yun' as ThemePreset,
  radius: '10px',
  storageKey: 'theme-preset',
  cookieMaxAge: 60 * 60 * 24 * 365
}

export function isThemePreset(
  value: string | undefined | null
): value is ThemePreset {
  return themePresets.includes(value as ThemePreset)
}

export function resolveThemePreset(value: string | undefined | null): ThemePreset {
  return isThemePreset(value) ? value : themeConfig.defaultPreset
}
