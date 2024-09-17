'use client'

import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Trophy, Share2, Youtube } from "lucide-react"
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen flex flex-col bg-indigo-50 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
          <motion.div className="container mx-auto px-4 text-center" {...fadeIn}>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Discover ChannelChat</h1>
            <p className="text-xl max-w-2xl mx-auto font-light">
              Elevate your YouTube experience with AI-powered conversations that bring content creators and audiences closer than ever before.
            </p>
          </motion.div>
        </section>

        <section className="py-20 bg-indigo-50 dark:bg-gray-800/50 dark:text-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div className="flex items-center justify-center" {...fadeIn}>
                <Image 
                  src="/logomark-play2.png" 
                  alt="ChannelChat Interaction" 
                  width={300} 
                  height={300} 
                  className="rounded-lg"
                />
              </motion.div>
              <motion.div {...fadeIn}>
                <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg mb-6 leading-relaxed">
                  ChannelChat is revolutionizing the way fans interact with their favorite YouTube channels. We create a unique, immersive experience where viewers can engage in dynamic, context-aware conversations with AI chatbots trained on specific channel content.
                </p>
                <p className="text-lg leading-relaxed">
                  Our platform enables in-depth discussions about video topics, provides behind-the-scenes insights, and even explores hypothetical scenarios related to the channel's content, fostering a deeper connection between creators and their audience.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-indigo-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-4xl font-bold mb-12 text-center" {...fadeIn}>
              Key Features
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI-powered Chatbots", description: "Engage with chatbots tailored to individual YouTube channels", icon: <MessageCircle className="h-8 w-8 text-blue-500" /> },
                { title: "Community Sponsorship", description: "Collaborate to unlock and maintain channel chatbots", icon: <Users className="h-8 w-8 text-green-500" /> },
                { title: "Leaderboards & Badges", description: "Earn recognition as a top contributor", icon: <Trophy className="h-8 w-8 text-yellow-500" /> },
                // { title: "Shared Conversations", description: "Learn and discuss collaboratively", icon: <Share2 className="h-8 w-8 text-purple-500" /> },
                // { title: "YouTube Integration", description: "Access up-to-date channel information", icon: <Youtube className="h-8 w-8 text-red-500" /> },
              ].map((feature, index) => (
                <motion.div key={index} {...fadeIn} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full transition-transform duration-300 hover:scale-105 bg-gray-200 dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        {feature.icon}
                        <span>{feature.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-200">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <motion.div className="container mx-auto px-4 text-center" {...fadeIn}>
            <h2 className="text-4xl font-bold mb-6">Join Us in Shaping the Future</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Embark on a journey of discovery, learning, and connection. Experience your favorite YouTube channels in ways you never thought possible!
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
              Learn More
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  )
}