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
      <CommunitySupport />
      {/* <LeaderboardActivityFeed /> */}
      {/* <HighlightedChats /> */}
      <Footer />
    </div>
  );
}