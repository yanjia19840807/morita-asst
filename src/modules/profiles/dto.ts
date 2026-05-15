export type UserIssueDto = {
  id: string
  priority: number
  tags: string[]
  description: string
}

export type UserProfileBaseDto = {
  id: string | null
  userId: string
  gender: string | null
  ageRange: string | null
  occupation: string | null
  issues: UserIssueDto[]
  createdAt: string | null
  updatedAt: string | null
}

export type UserProfileDetailDto = UserProfileBaseDto & {
  user: {
    id: string
    name: string
    email: string
  }
}