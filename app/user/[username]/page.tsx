// app/user/[username]/page.tsx
import { Header } from "@/components/Header"
import { UserProfile } from "@/components/UserProfile"
import { Footer } from "@/components/Footer"
import { getUserByUsername } from "@/lib/user"
import { Transaction } from "@prisma/client"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { User, UserBadge, Badge, Chat, Channel } from "@prisma/client"
import { channel } from "diagnostics_channel"

console.log('UserProfilePage loaded');

type UserWithRelations = User & {
  badges: (UserBadge & { badge: Badge })[];
  chats: Chat[];
  transactions: (Transaction & { channel: Channel })[];
};

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

  const sponsoredChannels = Array.from(new Set(user.transactions.map(t => t.channelId)))
    .map(channelId => {
      const transaction = user.transactions.find(t => t.channelId === channelId);
      return {
        id: channelId,
        channel: { name: transaction?.channel.name || '' }
      }
    });
  
  const totalSponsoredAmount = user.transactions.reduce((sum, t) => sum + t.amount, 0);

  // Transform the user data to match the expected structure
  const transformedUser = {
    name: user.name,
    username: user.username || '',
    image: user.image || undefined,
    sponsoredChatsCount: sponsoredChannels.length,
    participatedChatsCount: user.chats.length,
    sponsorships: sponsoredChannels,
    badges: user.badges.map(ub => ({
      id: ub.id,
      badge: { name: ub.badge.name }
    })),
    totalSponsoredAmount
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <UserProfile user={transformedUser} isOwnProfile={isOwnProfile} />
      <Footer />
    </div>
  )
}