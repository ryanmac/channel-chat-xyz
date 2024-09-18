// app/about/page.tsx
'use client'

import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, Trophy, Youtube, Shield, Zap } from "lucide-react"
import Image from 'next/image'
import { motion } from 'framer-motion'
import ChannelSearch from '@/components/ChannelSearch'
import { FeaturedChatInterface } from '@/components/FeaturedChatInterface'
import Link from 'next/link'
import { FeaturedChannels } from '@/components/FeaturedChannels'

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50 to-white text-gray-800 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200">
      <Header />
      <main className="flex-grow">
        {/* <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"> */}
        <section className="bg-gradient-to-r animate-spin-slow text-white py-20">
          <motion.div className="container mx-auto px-4 text-center" {...fadeIn}>
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">Start conversations that go beyond the play button</h1>
            <p className="text-3xl mb-8">
              Which channels would you like to chat with?
            </p>
            <div className="max-w-2xl mx-auto bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Start Your ChannelChat Journey</h2>
              <p className="mb-4">Enter a YouTube channel to create an AI-powered chatbot in seconds:</p>
              <ChannelSearch
                containerClassName="max-w-md mx-auto"
                inputClassName="h-12 text-base"
                buttonClassName="w-12 h-12"
              />
              <p className="mt-2 text-sm">Try it now - no account required!</p>
            </div>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-4xl font-bold mb-12 text-center" {...fadeIn}>
              What Makes Us Unique
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI-Powered Conversations", description: "Our cutting-edge AI analyzes YouTube transcripts to capture each creator's style and knowledge.", icon: <MessageCircle className="h-8 w-8 text-blue-500" /> },
                { title: "Community-Driven", description: "Empower viewers to activate and support their favorite channels, creating a vibrant ecosystem.", icon: <Users className="h-8 w-8 text-green-500" /> },
                { title: "Seamless Integration", description: "No extra work for creators – we tap into existing YouTube content to bring channels to life.", icon: <Youtube className="h-8 w-8 text-red-500" /> },
                { title: "Accessible Learning", description: "Transform any educational YouTube channel into an interactive tutor, available 24/7.", icon: <Zap className="h-8 w-8 text-yellow-500" /> },
                { title: "Ethical AI Use", description: "Committed to responsible AI use, ensuring a safe and ethical environment for all.", icon: <Shield className="h-8 w-8 text-purple-500" /> },
                { title: "Continuous Improvement", description: "Community support keeps channels active and helps improve the AI over time.", icon: <Trophy className="h-8 w-8 text-indigo-500" /> },
              ].map((feature, index) => (
                <motion.div key={index} {...fadeIn} transition={{ delay: index * 0.1 }}>
                  <Card className="h-full transition-transform duration-300 hover:scale-105 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        {feature.icon}
                        <span>{feature.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-indigo-100 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-4xl font-bold mb-12 text-center" {...fadeIn}>
              Your ChannelChat Journey
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Discover and Activate", story: "Meet Sarah, a tech enthusiast who loves learning about AI. She discovers ChannelChat through a tweet from her favorite tech YouTuber. Excited, she jumps in and finds that she can chat with an AI version of the channel right away!" },
                { title: "Engage and Learn", story: "John, a history buff, activates his favorite history channel on ChannelChat. Now, instead of just watching videos, he's asking in-depth questions about historical events, getting instant, tailored responses that feel just like talking to the creator." },
                { title: "Support and Grow", story: "Emily is passionate about sustainable living. She decides to sponsor her favorite eco-friendly channel on ChannelChat. Her contribution helps keep the chatbot running and improving, and she earns cool badges that showcase her support to the community." },
              ].map((journey, index) => (
                <motion.div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg" {...fadeIn} transition={{ delay: index * 0.1 }}>
                  <h3 className="text-2xl font-bold mb-4">{journey.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{journey.story}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-8 md:py-18 lg:py-24 xl:py-32 animate-spin-slow">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-4xl font-bold mb-12 text-center" {...fadeIn}>
              Experience ChannelChat
            </motion.h2>
            <div className="max-w-4xl mx-auto">
              <FeaturedChatInterface />
            </div>
          </div>
        </section>

        <section className="py-20 bg-indigo-100 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <motion.h2 className="text-4xl font-bold mb-12 text-center" {...fadeIn}>
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div className="flex justify-center" {...fadeIn}>
                <Image 
                  src="/logomark-play2.png" 
                  alt="How ChannelChat Works" 
                  width={400} 
                  height={400} 
                  className=""
                />
              </motion.div>
              <motion.div {...fadeIn}>
                <ol className="list-decimal list-inside space-y-4">
                  <li className="text-lg">We use advanced AI to process YouTube video transcripts.</li>
                  <li className="text-lg">Our system creates a unique chatbot for each channel, capturing the creator's voice and knowledge.</li>
                  <li className="text-lg">Users can interact with these chatbots, asking questions and diving deeper into topics.</li>
                  <li className="text-lg">Community support keeps channels active and helps improve the AI over time.</li>
                </ol>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-indigo-400 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <motion.h2 
              className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Featured Channels
            </motion.h2>
            <FeaturedChannels />
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h2 className="text-4xl font-bold mb-8" {...fadeIn}>
              Join the Conversation Revolution!
            </motion.h2>
            <motion.p className="text-xl mb-8 max-w-3xl mx-auto" {...fadeIn}>
              Ready to transform your YouTube experience? Start conversations that go beyond the play button. Whether you're here to learn, explore, or support your favorite creators, there's a chat waiting for you.
            </motion.p>
            <motion.div className="space-x-4" {...fadeIn}>
              <Link href="/">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}