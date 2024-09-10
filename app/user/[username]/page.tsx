// app/user/[username]/page.tsx
import { Header } from "@/components/Header"
import { UserProfile } from "@/components/UserProfile"
import { Footer } from "@/components/Footer"
import { getUserByUsername } from "@/lib/user"
import { notFound } from "next/navigation"
import { auth } from "@/auth"

console.log('UserProfilePage loaded');

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  console.log('UserProfilePage params:', params);
  console.log('UserProfilePage params.username:', params.username);
  const session = await auth();
  console.log('Session in UserProfilePage:', session);
  const user = await getUserByUsername(params.username);
  console.log('User fetched in UserProfilePage:', user);

  if (!user) {
    console.log(`User not found for username: ${params.username}`)
    notFound()
  }

  const isOwnProfile = session?.user?.username === params.username;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <UserProfile user={user} isOwnProfile={isOwnProfile} />
      <Footer />
    </div>
  )
}