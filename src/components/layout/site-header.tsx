import AppLogo from '../app-logo'
import UserToolbar from '../user-tool-bar'
import UserAvatar from '../user-avatar'
import { ThemeToggle } from '../theme-toggle'

export default function SiteHeader() {
  return (
    <nav className='bg-background/90 sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b backdrop-blur-sm'>
      <AppLogo />
      <div className='flex items-center gap-2'>
        <UserToolbar />
        <UserAvatar />
        <ThemeToggle />
      </div>
    </nav>
  )
}
