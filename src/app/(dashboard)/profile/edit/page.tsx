import ProfileEditForm from '@/components/auth/profile-edit-form'
import { PageShell } from '@/components/layout/page-shell'
import { toProfileEditFormValues } from '@/modules/auth/mapper'
import { fetchProfile } from '@/modules/auth/service'
import { fetchMyUserProfile, toUserProfileEditValues } from '@/modules/profiles'

export default async function ProfileEditPage() {
  const session = await fetchProfile()
  const profile =
    session.user.role === 'admin' ? null : await fetchMyUserProfile()

  return (
    <PageShell>
      <ProfileEditForm
        data={toProfileEditFormValues(session.user)}
        userRole={session.user.role}
        profileData={profile ? toUserProfileEditValues(profile) : null}
      />
    </PageShell>
  )
}
