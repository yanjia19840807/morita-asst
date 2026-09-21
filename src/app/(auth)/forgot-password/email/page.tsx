import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className='w-full max-w-lg'>
      <ForgotPasswordForm callbackUrl={callbackUrl} />
    </div>
  )
}
