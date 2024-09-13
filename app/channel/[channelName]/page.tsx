// app/channel/[channelName]/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChannelHeader } from '@/components/ChannelHeader';
import { SponsorshipCTA } from '@/components/SponsorshipCTA';
import { LeaderboardActivity } from '@/components/LeaderboardActivity';
import { ChatInterface } from '@/components/ChatInterface';
import { UnlockChannelChat } from '@/components/UnlockChannelChat';
import { CuratedChannels } from '@/components/CuratedChannels';
import { DisclaimerSection } from '@/components/DisclaimerSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/ui/spinner';
import { BotAttributesPanel } from '@/components/BotAttributesPanel';
import { FuelGauge } from '@/components/FuelGauge';
import { ShareChannelActivation } from '@/components/ShareChannelActivation';
import { ChannelProcessing } from '@/components/ChannelProcessing';
import { SuccessShareModal } from '@/components/SuccessShareModal2';
import { SignUpModal } from '@/components/SignUpModal';
import { BadgeType } from '@/utils/badgeManagement';
import { ChannelData } from '@/utils/channelManagement';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { refreshChannelInfo } from '@/utils/yesService';
import { getCache, setCache } from '@/utils/cache';

interface ChannelPageProps {
  params: {
    channelName: string;
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
  creditBalance?: number;
  maxCredits?: number;
  botScore?: number;
  isProcessing?: boolean;
  lastSponsorshipAmount?: number;
}

const defaultChannelData: ChannelData = {
  channel_id: '',
  unique_video_count: 0,
  total_embeddings: 0,
  metadata: {
    snippet: {
      title: '404 Testing Channel',
      description: 'Channel not found.',
      thumbnails: {
        default: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
        high: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
      },
      customUrl: '@404TestingChannel',
      localized: {
        title: '404 Title',
        description: '404 Description',
      },
      country: 'USA',
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
  const { data: session, status } = useSession();
  const { channelName: rawChannelName } = params;
  const channelName = rawChannelName.startsWith('%40') ? rawChannelName.slice(3) : rawChannelName;
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [botData, setBotData] = useState<BotData>({
    tier: 'Inactive',
    isActive: false,
    boosts: [],
    embeddedTranscripts: 0,
    totalVideos: 0,
    model: 'gpt-4o-mini',
    maxTokens: 200,
    chatsCreated: 0,
    creditBalance: 0,
    maxCredits: 1000,
    botScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChannelActive, setIsChannelActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [currentFunding, setCurrentFunding] = useState(0);
  const [goalFunding, setGoalFunding] = useState(10); // Consider fetching this from an API

  // Dynamic state based on sponsorship and funding
  const [sponsorshipAmount, setSponsorshipAmount] = useState(0); // The initial sponsorship amount
  const [totalFunding, setTotalFunding] = useState(currentFunding); // Set initial total funding from currentFunding
  const [newChatCreditsAdded, setNewChatCreditsAdded] = useState(0); // Start with zero new chat credits
  const [wasActivated, setWasActivated] = useState(botData.isActive); // Use botData to determine if it was activated

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const fetchedRef = useRef(false);
  const { toast } = useToast();

  const transferBadges = async () => {
    console.log(`Attempting to transfer badges for session ${sessionId} and user ${session?.user?.id}`);
    try {
      const response = await fetch('/api/badges/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to transfer badges');
      }
  
      const result = await response.json();
      console.log('Badge transfer result:', result);
  
      // Optionally refresh the user data or UI here
    } catch (error) {
      console.error('Error transferring badges:', error);
      // Implement retry logic here if needed
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && sessionId) {
      transferBadges();
    }
  }, [status, sessionId]);

  // Function to fetch badges associated with the session
  const fetchSessionBadges = useCallback(async () => {
    console.log('Channel Page: Fetching session badges for:', sessionId);
    if (!sessionId) return;

    const cacheKey = `session_badges_${sessionId}`;
    const cachedData = getCache(cacheKey);
    let badgesArray: BadgeType[] = [];
    try {
      if (cachedData) {
        console.log('Using cached session badges:', cachedData);
        setEarnedBadges(cachedData);
        badgesArray = cachedData;
      } else {
        const response = await fetch(`/api/badges/session?sessionId=${sessionId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch session badges: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        badgesArray = data.badges ? data.badges.split(',') : [];
        setEarnedBadges(badgesArray as BadgeType[]);
        setCache(cacheKey, badgesArray, 30); // Cache for 30 seconds
      }
      console.log('Session badges:',
        badgesArray.length > 0 ? badgesArray.join(', ') : 'No badges earned');
      if (badgesArray.length > 0) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error fetching session badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch session badges. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast]);

  // Function to fetch channel data and handle state updates
  const fetchChannelData = useCallback(async () => {
    if (fetchedRef.current) return;
    setIsLoading(true);
    setError(null);
    console.log('Fetching channel data for:', channelName);
    try {
      // Fetch the initial channel data
      const response = await fetch(`/api/yes/channel-info?channel_url=https://www.youtube.com/@${channelName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setChannelData(data);

      if (data && data.channel_id) {
        // Fetch bot data related to the channel
        const botResponse = await fetch(`/api/bot/info?channelId=${data.channel_id}`);
        if (!botResponse.ok) {
          throw new Error(`Failed to fetch bot data: ${botResponse.status} ${botResponse.statusText}`);
        }
        const botData = await botResponse.json();
        setBotData(botData);
        setIsChannelActive(botData.isActive);
        setIsProcessing(botData.isProcessing || false);

        // Calculate the current funding in dollars
        const currentFundingInDollars = botData.creditBalanace / 100;
        setCurrentFunding(currentFundingInDollars);
        setTotalFunding(currentFundingInDollars); // Update total funding based on current credits

        // Determine if the channel has been activated
        const activated = botData.isActive;
        setWasActivated(activated);

        // Update sponsorship amount and new chat credits if applicable
        const lastSponsorshipAmount = botData.lastSponsorshipAmount || 0; // Assuming you get this from botData
        setSponsorshipAmount(lastSponsorshipAmount);

        // Calculate new chat credits added
        const creditsAdded = lastSponsorshipAmount > 9 ? (lastSponsorshipAmount - 9) * 1000 : 0;
        setNewChatCreditsAdded(creditsAdded);

        // Fetch session badges after fetching channel data
        fetchSessionBadges();

        // Log for debugging
        console.log('Channel data:', data);
        console.log('Bot data:', botData);
        console.log('Channel is active:', activated);
        console.log('Channel is processing:', botData.isProcessing);
        console.log('Current funding:', currentFundingInDollars);
        console.log('New chat credits added:', creditsAdded);
        console.log('Sponsorship amount:', lastSponsorshipAmount);
      }
    } catch (error) {
      console.error('Error fetching channel data:', error);
      setError('Failed to load channel data. Please try again later.');
    } finally {
      setIsLoading(false);
      fetchedRef.current = true;
    }
  }, [channelName, fetchSessionBadges]);

  // Function to check the processing status of the channel
  const checkProcessingStatus = useCallback(async () => {
    if (!channelData?.channel_id) return;
    try {
      const response = await fetch(`/api/bot/info?channelId=${channelData.channel_id}`);
      console.log('Checking processing status for channel:', channelData.channel_id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBotData(data);
      setIsProcessing(data.isProcessing);
      setIsChannelActive(data.isActive);
      setCurrentFunding(data.creditBalanace / 100);
      // if (data.isActive) {
      //   setShowSuccessModal(true);
      // }
    } catch (error) {
      console.error('Error checking processing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check processing status. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [channelData, toast]);

  const debouncedFetchChannelData = useDebouncedCallback(fetchChannelData, 300);

  useEffect(() => {
    debouncedFetchChannelData();
    return () => {
      debouncedFetchChannelData.cancel();
    };
  }, [debouncedFetchChannelData]);

  useEffect(() => {
    if (sessionId && channelData?.channel_id) {
      checkProcessingStatus();
    }
  }, [sessionId, channelData, checkProcessingStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <Spinner size="large" />
        <div>Loading @{channelName}...</div>
      </div>
    );
  }

  if (error) {
    console.log(error);
  }

  const channelInfo = channelData || defaultChannelData;

  // Mock data - in a real app, this would come from your backend
  const leaderboardData = [
    { username: "User1", amount: 100, badge: "Top Sponsor" },
    { username: "User2", amount: 75 },
    { username: "User3", amount: 50 },
  ];

  const recentActivityData = [
    { username: "User4", action: "started a new chat", timestamp: "5 minutes ago" },
    { username: "User5", action: "sponsored the channel", timestamp: "10 minutes ago" },
    { username: "User6", action: "shared a conversation", timestamp: "15 minutes ago" },
  ];

  const curatedChannels = [
    { name: "@TechTalks", description: "Latest in technology", isSponsored: true },
    { name: "@AIDiscussion", description: "AI and machine learning topics", isSponsored: false },
    { name: "@ScienceDaily", description: "Daily science news", isSponsored: true },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <ChannelHeader
        channelName={channelName}
        channelTitle={channelInfo.metadata.snippet.localized.title}
        subscriberCount={parseInt(channelInfo.metadata.statistics.subscriberCount)}
        totalViews={parseInt(channelInfo.metadata.statistics.viewCount)}
        videoCount={parseInt(channelInfo.metadata.statistics.videoCount)}
        description={channelInfo.metadata.snippet.localized.description}
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
                  uniqueVideoCount={channelInfo.unique_video_count}
                />
                <DisclaimerSection />
              </div>
            ) : (
              <>
                <UnlockChannelChat
                  channelName={channelName}
                  channelTitle={channelInfo.metadata.snippet.title}
                  channelId={channelInfo.channel_id}
                  initialFunding={currentFunding}
                  goalFunding={goalFunding}
                  onFundingUpdate={fetchChannelData}
                />
                <ShareChannelActivation
                  channelName={channelName}
                  channelId={channelInfo.channel_id}
                  initialFunding={currentFunding}
                  goalFunding={goalFunding}
                />
              </>
            )}
          </div>
          <div>
            {isChannelActive && (
              <SponsorshipCTA
                channelName={channelName}
                channelTitle={channelInfo.metadata.snippet.title}
                channelId={channelInfo.channel_id}
                creditBalance={botData.creditBalance ?? 0}
              />
            )}
            {isChannelActive && (
              <div className="mb-8">
                <FuelGauge 
                  creditBalance={botData.creditBalance ?? 0}
                  maxCredits={botData.maxCredits ?? 100000}
                />
              </div>
            )}
            {isChannelActive && false && (
              <BotAttributesPanel
                channelId={channelInfo.channel_id}
                botTier={botData.tier}
                isActive={botData.isActive}
                onActivate={fetchChannelData}
              />
            )}
            {false && (
              <LeaderboardActivity
                leaderboard={leaderboardData}
                recentActivity={recentActivityData}
              />
            )}
            {!botData.isActive && !isProcessing && (
              <>
                {/* <h2 className="text-2xl font-bold mt-8">Explore other channels...</h2> */}
                <CuratedChannels channels={curatedChannels} />
              </>
            )}
          </div>
        </div>
      </div>
      <SuccessShareModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          if (status !== 'authenticated') {
            setShowSignUpModal(true);
          }
        }}
        channelName={channelName}
        channelTitle={channelInfo.metadata.snippet.title}
        badges={earnedBadges}
        sponsorshipAmount={sponsorshipAmount} // The amount of the most recent sponsorship
        totalFunding={totalFunding} // The total funding amount for the channel
        newChatCreditsAdded={newChatCreditsAdded} // The number of new chat credits added from the recent sponsorship
        wasActivated={wasActivated} // A boolean indicating whether the channel was activated by this sponsorship
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        badges={earnedBadges}
      />
      <Footer />
    </div>
  );
}