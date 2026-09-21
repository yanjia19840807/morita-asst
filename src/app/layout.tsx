import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { DM_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemePresetProvider } from '@/components/theme-preset-provider'
import QueryProvider from '@/components/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { resolveThemePreset, themeConfig } from '@/modules/theme'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans'
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '云天助手',
  description:
    '真实案例 + 森田疗法智慧，让你知道：你并不孤单。顺其自然，为所当为。'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const preset = resolveThemePreset(
    cookieStore.get(themeConfig.storageKey)?.value
  )

  return (
    <html
      lang='zh-CN'
      data-theme={preset}
      className={cn(
        'h-full',
        'antialiased',
        dmSans.variable,
        geistMono.variable,
        'font-sans'
      )}
      suppressHydrationWarning
    >
      <head></head>
      <body
        className='mx-auto flex h-full min-h-screen w-full flex-col'
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <QueryProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme={themeConfig.defaultMode}
              enableSystem
              disableTransitionOnChange
            >
              <ThemePresetProvider preset={preset}>
                {children}
                <Toaster position='top-center' />
              </ThemePresetProvider>
            </ThemeProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
