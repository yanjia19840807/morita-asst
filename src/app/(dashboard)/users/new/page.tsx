import { UserCreateForm } from '@/components/auth/user-create-form'

export default function UserNewPage() {
  return (
    <div className='flex flex-1 flex-col gap-3 px-4'>
      <UserCreateForm />
    </div>
  )
}
