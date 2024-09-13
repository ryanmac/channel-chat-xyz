// app/settings/page.tsx
import { auth } from "@/auth"
import { getUserById } from "@/lib/user"
import { ProfileEditForm } from "@/components/ProfileEditForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()
  console.log('Session in SettingsPage:', session);
  
  if (!session?.user?.id) {
    console.log("No user ID in session")
    redirect("/")
  }

  const user = await getUserById(session.user.id);
  console.log('User fetched in SettingsPage:', user); 

  // if (!user) {
  //   console.log(`User not found for ID: ${session.user.id}`)
  //   redirect("/")
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      {/* <ProfileEditForm user={user} /> */}
    </div>
  )
}