import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import QueryProvider from '@/components/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: '森田助手',
  description:
    '真实案例 + 森田疗法智慧，让你知道：你并不孤单。顺其自然，为所当为。'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        inter.variable
      )}
      suppressHydrationWarning
    >
      <head>
        {/*
         * scrollbar-gutter: stable — always reserve gutter space so viewport
         * content width stays constant when scrollbar appears/disappears.
         * overflow-x: hidden — prevent margin-right added by react-remove-scroll-bar
         * from creating a horizontal scrollbar on <html>.
         */}
        <style>{`html { scrollbar-gutter: stable; overflow-x: hidden; overflow-y: scroll; }`}</style>
      </head>
      <body className='mx-auto flex h-full min-h-screen w-full flex-col'>
        <NuqsAdapter>
          <QueryProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position='top-center' />
            </ThemeProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
