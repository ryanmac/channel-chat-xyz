'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function HighlightedChats() {
  const highlightedChats = [
    { title: "The Future of AI", channel: "@TechTalks", snippet: "Discussing the implications of advanced AI..." },
    { title: "Best Gaming Strategies", channel: "@GamingGurus", snippet: "Top players share their secrets..." },
    { title: "Vegan Cooking Tips", channel: "@CookingCorner", snippet: "Learn how to make delicious vegan meals..." },
  ]

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Highlighted Community Chats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlightedChats.map((chat, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{chat.title}</CardTitle>
                <p className="text-sm text-gray-500">{chat.channel}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">{chat.snippet}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Conversation</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}