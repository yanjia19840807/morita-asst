import Link from 'next/link'

export default function AppLogo() {
  return (
    <Link
      href='/'
      className='text-lg font-semibold tracking-tight'
      suppressHydrationWarning
    >
      云天助手
    </Link>
  )
}
