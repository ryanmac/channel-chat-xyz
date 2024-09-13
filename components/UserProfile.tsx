// components/UserProfile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadgeComponent } from "@/components/BadgeComponent";
import { BadgeType } from "@/utils/badgeManagement";
import Link from "next/link";
import { Edit, MessageCircle, Award, Users, Share2, UserX, RotateCcw } from "lucide-react";

interface UserProfileProps {
  user: {
    name: string | null;
    username: string;
    image?: string;
    sponsoredChatsCount: number;
    participatedChatsCount: number;
    sponsorships: Array<{ id: string; channel: { name: string, title: string, imageUrl: string } }>;
    badges: Array<{ id: string; badge: { name: string } }>;
    totalSponsoredAmount: number;
  } | null;
  isOwnProfile: boolean;
}

function UserNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] bg-gradient-to-b from-primary/5 to-background rounded-lg shadow-lg p-8">
      <UserX className="h-24 w-24 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
      <p className="text-muted-foreground text-center mb-6">
        Oops! We couldn't find the user you're looking for. They may have changed their username or the profile might not exist.
      </p>
      <div className="space-x-4">
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
        <Button onClick={() => window.location.reload()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

export function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  if (!user) {
    console.log("User not found:", user);
    return <UserNotFound />;
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-b from-primary/5 to-background rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <Avatar className="h-32 w-32 border-4 border-primary/20">
          <AvatarImage src={user.image || ""} alt={user.name || ""} />
          <AvatarFallback className="text-4xl">{user.name ? user.name[0] : "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {isOwnProfile && (
            <Link href="/settings" passHref>
              <Button variant="outline" className="mt-2 flex items-center space-x-2">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Chat Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              Sponsored Chats: <span className="font-semibold">{user.sponsoredChatsCount}</span>
            </p>
            <p className="text-sm">
              Participated Chats: <span className="font-semibold">{user.participatedChatsCount}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Sponsored Channels</CardTitle>
          </CardHeader>
          <CardContent>
            {user.sponsorships && user.sponsorships.length > 0 ? (
              <>
                <ul className="flex flex-wrap gap-2">
                  {user.sponsorships.map((sponsorship) => (
                    <li key={sponsorship.id}>
                      <Link href={`/channel/${sponsorship.channel.name}`} className="text-sm hover:text-primary transition-colors">
                        <Badge
                          variant="secondary"
                          className="bg-purple-200 text-purple-800 hover:bg-purple-300 hover:text-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2 p-2"
                        >
                          <Avatar className="h-12 w-12 border-4 border-primary/20 mr-2">
                            <AvatarImage src={sponsorship.channel.imageUrl || ""} alt={sponsorship.channel.title || ""} />
                            <AvatarFallback className="text-4xl">
                              {sponsorship.channel.title ? sponsorship.channel.title[0] : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span>{sponsorship.channel.title}</span>
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* <p className="text-sm mt-4">
                  Total Sponsorship: <span className="font-semibold">${user.totalSponsoredAmount.toFixed(0)}</span>
                </p> */}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No sponsored channels yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Earned Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((userBadge) => (
                  <BadgeComponent key={userBadge.id} type={userBadge.badge.name as BadgeType} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No badges earned yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-x-2">
            <Share2 className="h-5 w-5 text-primary" />
            <CardTitle>Shared Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}