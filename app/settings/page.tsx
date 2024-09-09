// app/settings/page.tsx
import { auth } from "@/auth"
import { getUserById } from "@/lib/user"
import { ProfileEditForm } from "@/components/ProfileEditForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/")
  }

  const user = await getUserById(session.user.id)

  if (!user) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <ProfileEditForm user={user} />
    </div>
  )
}