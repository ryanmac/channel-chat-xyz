'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Youtube, MessageCircle, Zap } from "lucide-react"

const channels = [
  { 
    name: "DrWaku", 
    title: "Dr. Waku's Science Lab",
    subscribers: "1.2M", 
    chats: 5000, 
    tokensUsed: 50000, 
    tokensRemaining: 10000,
    avatarUrl: "https://i.pravatar.cc/150?u=drwaku"
  },
  { 
    name: "GamingGurus", 
    title: "Gaming Gurus",
    subscribers: "800K", 
    chats: 3000, 
    tokensUsed: 30000, 
    tokensRemaining: 20000,
    avatarUrl: "https://i.pravatar.cc/150?u=gaminggurus"
  },
  { 
    name: "CookingCorner", 
    title: "Cooking Corner",
    subscribers: "500K", 
    chats: 2000, 
    tokensUsed: 20000, 
    tokensRemaining: 30000,
    avatarUrl: "https://i.pravatar.cc/150?u=cookingcorner"
  },
]

export function FeaturedChannels() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 md:px-6">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Channels
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {channels.map((channel, index) => (
            <motion.div
              key={channel.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      <AvatarImage src={channel.avatarUrl} alt={channel.name} />
                      <AvatarFallback>{channel.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold">{channel.title}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Youtube className="w-4 h-4 mr-1" />
                        {channel.subscribers} subscribers
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">Chats:</span>
                      <span className="ml-auto">{channel.chats.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="font-medium">Tokens Used:</span>
                      <span className="ml-auto">{channel.tokensUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 mr-2 text-green-500" />
                      <span className="font-medium">Tokens Remaining:</span>
                      <span className="ml-auto">{channel.tokensRemaining.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={`/channel/@${channel.name.replace(/\s+/g, '-').toLowerCase()}`} passHref className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Chat Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}