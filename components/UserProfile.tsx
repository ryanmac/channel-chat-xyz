// components/UserProfile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface UserProfileProps {
  user: any // Replace 'any' with a proper user type
  isOwnProfile: boolean
}

export function UserProfile({ user, isOwnProfile }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.image || ''} alt={user.name || ''} />
          <AvatarFallback>{user.name ? user.name[0] : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">@{user.username}</p>
        </div>
        {isOwnProfile && (
          <Button asChild>
            <Link href="/settings">Edit Profile</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sponsored Chats: {user.sponsoredChatsCount}</p>
            <p>Participated Chats: {user.participatedChatsCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sponsored Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {user.sponsorships.map((sponsorship: any) => (
                <li key={sponsorship.id}>
                  <Link href={`/channel/${sponsorship.channel.name}`}>
                    {sponsorship.channel.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earned Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {user.badges.map((badge: any) => (
                <li key={badge.id}>{badge.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}