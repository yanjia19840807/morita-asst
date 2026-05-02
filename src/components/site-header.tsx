import Logo from './logo'
import UserToolbar from './user-tool-bar'
import UserAvatar from './user-avatar'
import { ModeToggle } from './mode-toggle'

export default function SiteHeader() {
  return (
    <nav className='flex w-full justify-between py-2'>
      <div className='flex items-center gap-4'>
        <Logo />
      </div>

      <div className='flex items-center gap-3'>
        <UserToolbar />
        <UserAvatar />
        <ModeToggle />
      </div>
    </nav>
  )
}
