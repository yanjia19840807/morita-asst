import EmailSignInForm from '@/components/auth/email-sign-in-form'

export default async function SignInPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams

  return (
    <div className='w-full max-w-lg'>
      <EmailSignInForm callbackUrl={callbackUrl} />
    </div>
  )
}
