import { Suspense } from 'react'
import ResetPasswordForm from '@/components/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className='w-full max-w-lg'>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
