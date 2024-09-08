// app/channel/[channelName]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { ChannelHeader } from "@/components/ChannelHeader"
import { SponsorshipCTA } from "@/components/SponsorshipCTA"
import { LeaderboardActivity } from "@/components/LeaderboardActivity"
import { ChatInterface } from "@/components/ChatInterface"
import { UnlockChannelChat } from "@/components/UnlockChannelChat"
import { CuratedChannels } from "@/components/CuratedChannels"
import { DisclaimerSection } from "@/components/DisclaimerSection"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Spinner } from "@/components/ui/spinner"
import { BotAttributesPanel } from '@/components/BotAttributesPanel'
import { ShareChannelActivation } from '@/components/ShareChannelActivation'
import { ChannelProcessing } from '@/components/ChannelProcessing'
import { SuccessShareModal } from '@/components/SuccessShareModal'
import { SignUpModal } from '@/components/SignUpModal'
import { BadgeComponent, BadgeType } from '@/components/BadgeComponent';
import { useToast } from "@/hooks/use-toast"

interface ChannelPageProps {
  params: {
    channelName: string
  }
}

interface ChannelData {
  channel_id: string;
  unique_video_count: string;
  metadata: {
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        high: { url: string };
      };
      customUrl: string;
    };
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
    brandingSettings: {
      image: {
        bannerExternalUrl: string;
      };
    };
  };
}

interface BotData {
  tier: string;
  isActive: boolean;
  boosts: string[];
  embeddedTranscripts?: number;
  totalVideos?: number;
  model?: string;
  maxTokens?: number;
  chatsCreated?: number;
  creditsRemaining?: number;
  maxCredits?: number;
  botScore?: number;
  isProcessing?: boolean;
}

interface FuelData {
  percentage: number;
  credits: number;
}

const defaultChannelData: ChannelData = {
  channel_id: '',
  unique_video_count: '0',
  metadata: {
    snippet: {
      title: '404 Testing Channel',
      description: 'Channel not found.',
      thumbnails: {
        default: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
        high: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
      },
      customUrl: '@404TestingChannel'
    },
    statistics: {
      subscriberCount: '0',
      viewCount: '0',
      videoCount: '0',
    },
    brandingSettings: {
      image: {
        bannerExternalUrl: '/placeholder.svg?height=200&width=1000&text=Channel+Banner',
      },
    },
  },
};

export default function ChannelPage({ params }: ChannelPageProps) {
  const { channelName: rawChannelName } = params
  const channelName = rawChannelName.startsWith('%40') ? rawChannelName.slice(3) : rawChannelName
  const [channelData, setChannelData] = useState<ChannelData | null>(null)
  const [botData, setBotData] = useState<BotData>({
    tier: 'Inactive',
    isActive: false,
    boosts: [],
    embeddedTranscripts: 0,
    totalVideos: 0,
    model: 'gpt-3.5-turbo',
    maxTokens: 200,
    chatsCreated: 0,
    creditsRemaining: 0,
    maxCredits: 1000,
    botScore: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChannelActive, setIsChannelActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([])
  const [currentFunding, setCurrentFunding] = useState(0)
  const [goalFunding, setGoalFunding] = useState(10) // Consider fetching this from an API
  const { toast } = useToast();

  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const fetchedRef = useRef(false)

  const fetchChannelData = useCallback(async () => {
    if (fetchedRef.current) return
    setIsLoading(true)
    setError(null)
    console.log('Fetching channel data for:', channelName)
    try {
      const response = await fetch(`/api/yes/channel-info?channel_url=https://www.youtube.com/@${channelName}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setChannelData(data)
  
      if (data && data.channel_id) {
        const botResponse = await fetch(`/api/bot/info?channelId=${data.channel_id}`)
        if (!botResponse.ok) {
          throw new Error(`Failed to fetch bot data: ${botResponse.status} ${botResponse.statusText}`)
        }
        const botData = await botResponse.json()
        setBotData(botData)
        setIsChannelActive(botData.isActive)
        setIsProcessing(botData.isProcessing || false)
        setCurrentFunding(botData.creditsRemaining / 100)
      }
  
      console.log('Channel data:', data)
      console.log('Bot data:', botData)
      console.log('Channel is active:', botData.isActive)
      console.log('Channel is processing:', botData.isProcessing)
      console.log('Current funding:', botData.creditsRemaining !== undefined ? botData.creditsRemaining / 100 : 'N/A')
      console.log('Goal funding:', goalFunding)
      console.log('Session ID:', sessionId)
  
    } catch (error) {
      console.error('Error fetching channel data:', error)
      setError('Failed to load channel data. Please try again later.')
    } finally {
      setIsLoading(false)
      fetchedRef.current = true
    }
  }, [channelName, sessionId, goalFunding])

  const debouncedFetchChannelData = useDebouncedCallback(fetchChannelData, 300)

  const checkProcessingStatus = useCallback(async () => {
    if (!channelData?.channel_id) return
    try {
      const response = await fetch(`/api/bot/info?channelId=${channelData.channel_id}`);
      console.log('Checking processing status for channel:', channelData.channel_id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBotData(data);
      setIsProcessing(data.isProcessing);
      setIsChannelActive(data.isActive);
      setCurrentFunding(data.creditsRemaining / 100);
      if (data.isActive) {
        setShowSuccessModal(true);
        setEarnedBadges(data.earnedBadges || []);
      }
    } catch (error) {
      console.error('Error checking processing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check processing status. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [channelData, toast])

  useEffect(() => {
    debouncedFetchChannelData()
    return () => {
      debouncedFetchChannelData.cancel()
    }
  }, [debouncedFetchChannelData])
  
  useEffect(() => {
    if (sessionId && channelData?.channel_id) {
      checkProcessingStatus()
    }
  }, [sessionId, channelData, checkProcessingStatus])

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <Spinner size="large" />
        <div>Loading @{channelName}...</div>
      </div>
    )
  }

  if (error) {
    console.log(error)
  }

  const channelInfo = channelData || defaultChannelData

  // Mock data - in a real app, this would come from your backend
  const leaderboardData = [
    { username: "User1", amount: 100, badge: "Top Sponsor" },
    { username: "User2", amount: 75 },
    { username: "User3", amount: 50 },
  ]

  const recentActivityData = [
    { username: "User4", action: "started a new chat", timestamp: "5 minutes ago" },
    { username: "User5", action: "sponsored the channel", timestamp: "10 minutes ago" },
    { username: "User6", action: "shared a conversation", timestamp: "15 minutes ago" },
  ]

  const curatedChannels = [
    { name: "@TechTalks", description: "Latest in technology", isSponsored: true },
    { name: "@AIDiscussion", description: "AI and machine learning topics", isSponsored: false },
    { name: "@ScienceDaily", description: "Daily science news", isSponsored: true },
  ]

  return (
    <div className="min-h-screen">
      <Header isLoggedIn={false} />
      <ChannelHeader
        channelName={channelName}
        channelTitle={channelInfo.metadata.snippet.title}
        subscriberCount={parseInt(channelInfo.metadata.statistics.subscriberCount)}
        totalViews={parseInt(channelInfo.metadata.statistics.viewCount)}
        videoCount={parseInt(channelInfo.metadata.statistics.videoCount)}
        description={channelInfo.metadata.snippet.description}
        bannerUrl={channelInfo.metadata.brandingSettings.image.bannerExternalUrl}
        profilePictureUrl={channelInfo.metadata.snippet.thumbnails.default.url}
        botTier={botData.tier}
        isActive={botData.isActive}
        chatsCreated={0}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isProcessing ? (
              <ChannelProcessing channelName={channelInfo.metadata.snippet.title} />
            ) : isChannelActive ? (
              <div>
                <ChatInterface 
                  channelName={channelInfo.metadata.snippet.title} 
                  channelId={channelInfo.channel_id} 
                  profilePictureUrl={channelInfo.metadata.snippet.thumbnails.default.url}
                  botTier={botData.tier}
                  boosts={botData.boosts}
                  isActive={botData.isActive}
                  uniqueVideoCount={parseInt(channelInfo.unique_video_count)}
                />
                <DisclaimerSection />
              </div>
            ) : (
              <>
                <UnlockChannelChat
                  channelName={channelName}
                  channelTitle={channelInfo.metadata.snippet.title}
                  channelId={channelInfo.channel_id}
                  currentFunding={currentFunding}
                  goalFunding={goalFunding}
                  onFundingUpdate={fetchChannelData}
                />
                <ShareChannelActivation
                  channelName={channelName}
                  currentFunding={currentFunding}
                  goalFunding={goalFunding}
                />
              </>
            )}
          </div>
          <div className="mt-8">
            {isChannelActive && (
              <SponsorshipCTA
                channelName={channelName}
                channelTitle={channelInfo.metadata.snippet.title}
                channelId={channelInfo.channel_id}
              />
            )}
            {isChannelActive && (
              <BotAttributesPanel
                channelId={channelInfo.channel_id}
                botTier={botData.tier}
                isActive={botData.isActive}
                onActivate={fetchChannelData}
              />
            )}
            <LeaderboardActivity
              leaderboard={leaderboardData}
              recentActivity={recentActivityData}
            />
            {!botData.isActive && !isProcessing && (
              <>
                <h2 className="text-2xl font-bold mt-8">Explore other channels...</h2>
                <CuratedChannels channels={curatedChannels} />
              </>
            )}
          </div>
        </div>
      </div>
      <SuccessShareModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          setShowSignUpModal(true)
        }}
        channelName={channelName}
        channelTitle={channelInfo.metadata.snippet.title}
        badges={earnedBadges}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
      />
      <Footer />
    </div>
  )
}