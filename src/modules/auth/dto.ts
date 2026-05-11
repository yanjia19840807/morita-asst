export type AuthRoleDto = 'user' | 'admin'

export interface AuthUserDto {
  id: string
  email: string
  name: string
  image: string | null
  role: string | null
  emailVerified: boolean
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: Date | null
}

export interface AuthSessionDto {
  user: AuthUserDto
}

export interface AuthUsersListDto {
  users: AuthUserDto[]
  total: number
}
