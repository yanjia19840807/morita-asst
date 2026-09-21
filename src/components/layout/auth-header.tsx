import AppLogo from '@/components/app-logo'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthHeader() {
  return (
    <div className='flex h-16 items-center justify-between'>
      <AppLogo />
      <ThemeToggle />
    </div>
  )
}
