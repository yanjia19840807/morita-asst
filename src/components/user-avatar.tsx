'use client'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { authClient } from '@/modules/auth/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { Home, LogOut, UserRound } from 'lucide-react'
import { DEFAULT_LOGOUT_REDIRECT } from '@/modules/auth/redirect'
import { useMounted } from '@/hooks/use-mounted'

export default function UserAvatar() {
  const router = useRouter()
  const mounted = useMounted()
  const { data: userData } = authClient.useSession()

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace(DEFAULT_LOGOUT_REDIRECT)
        }
      }
    })
  }

  if (!mounted || !userData) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='focus-visible:ring-ring cursor-pointer rounded-full outline-none focus-visible:ring-2'>
          <Avatar>
            <AvatarImage src={userData.user.image || '/avatar-default.svg'} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1'>
            <p className='text-sm font-medium'>{userData.user.name}</p>
            <p className='text-muted-foreground truncate text-xs'>
              {userData.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <UserRound />
          个人中心
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/')}>
          <Home />
          返回首页
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
