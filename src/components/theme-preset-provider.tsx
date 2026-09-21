'use client'

import * as React from 'react'
import {
  resolveThemePreset,
  themeConfig,
  type ThemePreset
} from '@/modules/theme'

function writePresetCookie(preset: ThemePreset) {
  document.cookie = `${themeConfig.storageKey}=${preset}; path=/; max-age=${themeConfig.cookieMaxAge}`
}

type ThemePresetContextValue = {
  preset: ThemePreset
  setPreset: (preset: ThemePreset) => void
}

const ThemePresetContext = React.createContext<ThemePresetContextValue | null>(
  null
)

export function ThemePresetProvider({
  preset: initialPreset,
  children
}: {
  preset: ThemePreset
  children: React.ReactNode
}) {
  const [preset, setPresetState] = React.useState(initialPreset)

  const setPreset = React.useCallback((next: ThemePreset) => {
    const resolved = resolveThemePreset(next)
    setPresetState(resolved)
    document.documentElement.dataset.theme = resolved
    writePresetCookie(resolved)
  }, [])

  React.useEffect(() => {
    document.documentElement.dataset.theme = preset
  }, [preset])

  const value = React.useMemo(
    () => ({ preset, setPreset }),
    [preset, setPreset]
  )

  return (
    <ThemePresetContext.Provider value={value}>
      {children}
    </ThemePresetContext.Provider>
  )
}

export function useThemePreset() {
  const context = React.useContext(ThemePresetContext)
  if (!context) {
    throw new Error('useThemePreset must be used within a ThemePresetProvider.')
  }

  return context
}
