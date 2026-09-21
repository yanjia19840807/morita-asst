import EmailSignUpForm from '@/components/auth/email-sign-up-form'

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className='w-full max-w-lg'>
      <EmailSignUpForm callbackUrl={callbackUrl} />
    </div>
  )
}
