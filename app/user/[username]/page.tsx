// app/user/[username]/page.tsx
import { Header } from "@/components/Header";
import { UserProfile } from "@/components/UserProfile";
import { Footer } from "@/components/Footer";
import { getUserByUsername } from "@/lib/user";
import { Transaction } from "@prisma/client";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { User, UserBadge, Badge, Chat, Channel, ChatSession } from "@prisma/client";

type UserBadgeWithRelations = {
  id: string;
  userId: string;
  badgeId: string;
  createdAt: Date;
  channelId: string | null;
  transactionId: string | null;
} & {
  badge: Badge;
  transaction?: (Transaction & { channel?: Channel }) | null;
  channel?: Channel;
};

type UserWithRelations = User & {
  badges: UserBadgeWithRelations[];
  chats: ChatSession[];
  transactions: (Transaction & { channel: Channel })[];
};

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.username === params.username;

  // Count badges by name
  const badgeCounts = user.badges.reduce((acc, userBadge) => {
    if (!userBadge.badge) return acc; // Ensure badge exists
    const badgeName = userBadge.badge.name;
    acc[badgeName] = (acc[badgeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group badges by channels using the channel and transaction relation
  const badgesByChannel = user.badges.reduce((acc, userBadge) => {
    const badgeChannel = userBadge.channel;

    if (!badgeChannel) {
      console.warn(`Badge ${userBadge.id} is missing channel data.`);
      return acc;
    }

    const channelId = badgeChannel.id;
    if (!acc[channelId]) {
      acc[channelId] = {
        channel: badgeChannel,
        badges: [],
      };
    }
    acc[channelId].badges.push(userBadge);
    return acc;
  }, {} as Record<string, { channel: Channel; badges: UserBadgeWithRelations[] }>);

  // Get the unique sponsored channels with their associated badges
  const sponsoredChannels = Object.values(badgesByChannel).map(({ channel, badges }) => ({
    id: channel.id,
    channel: {
      name: channel.name,
      title: channel.title || "",
      imageUrl: channel.imageUrl || "",
    },
    badges: badges.map((b) => ({
      id: b.id,
      badge: b.badge,
      count: badgeCounts[b.badge.name] || 1,
    })),
  }));

  // Calculate total sponsored amount and chats
  let totalSponsoredAmount = 0;
  let totalSponsoredChats = 0;

  user.transactions.forEach((t) => {
    if (t.type === "CREDIT_PURCHASE") {
      totalSponsoredAmount += t.amount / 1000;
      totalSponsoredChats += t.amount;
    } else if (t.type === "ACTIVATION") {
      totalSponsoredAmount += t.amount;
    }
  });

  const transformedUser = {
    name: user.name,
    username: user.username || "",
    image: user.image || undefined,
    sponsoredChatsCount: totalSponsoredChats,
    participatedChatsCount: user.ChatSession.length,
    sponsorships: sponsoredChannels,
    badges: Object.entries(badgeCounts).map(([name, count]) => ({ name, count })),
    totalSponsoredAmount,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <UserProfile user={transformedUser} isOwnProfile={isOwnProfile} />
      <Footer />
    </div>
  );
}