import { UserAccountReadout } from '@/components/auth/user-account-readout'
import { UserSection } from '@/components/auth/user-section'
import type { AuthUserDto } from '@/modules/auth/dto'

export function UserDetail({ user }: { user: AuthUserDto }) {
  return (
    <UserSection>
      <UserAccountReadout user={user} />
    </UserSection>
  )
}
