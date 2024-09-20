// app/(main)/page.tsx
'use client';

import { Hero } from "@/components/Hero";
import { motion } from "framer-motion";
import { FeaturedChannels } from "@/components/FeaturedChannels";
import { CommunitySupport } from "@/components/CommunitySupport";
import { LeaderboardActivityFeed } from "@/components/LeaderboardActivityFeed";
import { HighlightedChats } from "@/components/HighlightedChats";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CollabList from "@/components/CollabList";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      <section className="py-16">
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
      <div className="col-span-full flex items-center justify-center">
        <Avatar className="border-none mr-2">
          <AvatarImage src="/logomark-play2.png" alt="ChannelChat" />
          <AvatarFallback>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-bold text-center text-primary">Collabs</h2>
      </div>
      <CollabList limit={6} />
      <CommunitySupport />
      {/* <LeaderboardActivityFeed /> */}
      {/* <HighlightedChats /> */}
      <Footer />
    </div>
  );
}