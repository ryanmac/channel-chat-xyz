'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturedChannels() {
  const channels = [
    { name: "DrWaku", subscribers: "1.2M", chats: 5000, tokensUsed: 50000, tokensRemaining: 10000 },
    { name: "GamingGurus", subscribers: "800K", chats: 3000, tokensUsed: 30000, tokensRemaining: 20000 },
    { name: "CookingCorner", subscribers: "500K", chats: 2000, tokensUsed: 20000, tokensRemaining: 30000 },
  ]

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <Card key={channel.name}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`/public/vercel?height=40&width=40&text=${channel.name[0]}`} />
                    <AvatarFallback>{channel.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{channel.name}</CardTitle>
                    <p className="text-sm text-gray-500">{channel.subscribers} subscribers</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Chats: {channel.chats}</p>
                  <p>Tokens Used: {channel.tokensUsed}</p>
                  <p>Tokens Remaining: {channel.tokensRemaining}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/channel/@${channel.name.replace(/\s+/g, '-').toLowerCase()}`} passHref>
                  <Button className="w-full">Chat Now</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}