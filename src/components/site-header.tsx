import Logo from './logo'
import AuthBar from './auth-bar'
import UserAvatar from './user-avatar'
import { ModeToggle } from './mode-toggle'

export default function SiteHeader() {
  return (
    <nav className='flex w-full justify-between py-2'>
      <div className='flex items-center gap-4'>
        <Logo />
      </div>

      <div className='flex items-center gap-3'>
        <AuthBar />
        <UserAvatar />
        <ModeToggle />
      </div>
    </nav>
  )
}
