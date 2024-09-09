// app/(main)/page.tsx
import { Hero } from "@/components/Hero"
import { FeaturedChannels } from "@/components/FeaturedChannels"
import { CommunitySupport } from "@/components/CommunitySupport"
import { LeaderboardActivityFeed } from "@/components/LeaderboardActivityFeed"
import { HighlightedChats } from "@/components/HighlightedChats"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={false} />
      <Hero />
      <FeaturedChannels />
      <CommunitySupport />
      {/* <LeaderboardActivityFeed /> */}
      {/* <HighlightedChats /> */}
      <Footer />
    </div>
  )
}