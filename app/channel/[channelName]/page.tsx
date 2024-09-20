// app/channel/[channelName]/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { ChannelHeader } from '@/components/ChannelHeader';
import { SponsorshipCTA } from '@/components/SponsorshipCTA';
import { LeaderboardActivity } from '@/components/LeaderboardActivity';
import { ChatInterface } from '@/components/ChatInterface';
import { UnlockChannelChat } from '@/components/UnlockChannelChat';
import { FeaturedChannels } from '@/components/FeaturedChannels';
import { DisclaimerSection } from '@/components/DisclaimerSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Spinner } from '@/components/ui/spinner';
import { BotAttributesPanel } from '@/components/BotAttributesPanel';
import { FuelGauge } from '@/components/FuelGauge';
import { ShareChannelActivation } from '@/components/ShareChannelActivation';
import { ChannelProcessing } from '@/components/ChannelProcessing';
import { SuccessShareModal } from '@/components/SuccessShareModal';
import { SignUpModal } from '@/components/SignUpModal';
import { BadgeType } from '@/utils/badgeManagement';
import { ChannelData } from '@/utils/channelManagement';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { defaultChannelData } from '@/constants/channelData';
import { getCache, setCache } from '@/utils/cache';
import { Merge } from 'lucide-react';
// import { Bot } from 'lucide-react';
import { FaRobot } from "react-icons/fa6";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChannelPageProps {
  params: {
    channelName: string;
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { data: session, status } = useSession();
  const { channelName: rawChannelName } = params;
  const channelName = rawChannelName.startsWith('%40') ? rawChannelName.slice(3) : rawChannelName;
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChannelActive, setIsChannelActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);

  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const fetchedRef = useRef(false);
  const { toast } = useToast();

  const transferBadges = async () => {
    // console.log(`Attempting to transfer badges for session ${sessionId} and user ${session?.user?.id}`);
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
  
    } catch (error) {
      console.error('Error transferring badges:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && sessionId) {
      transferBadges();
    }
  }, [status, sessionId]);

  const fetchSessionBadges = useCallback(async () => {
    if (!sessionId) return;

    // console.log('Channel Page: Fetching session badges for:', sessionId);
    const cacheKey = `session_badges_${sessionId}`;
    const cachedData = getCache(cacheKey);
    let badgesArray: BadgeType[] = [];
    try {
      if (cachedData) {
        // console.log('Using cached session badges:', cachedData);
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
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error fetching session badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch session badges. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast]);

  const fetchChannelData = useCallback(async () => {
    if (fetchedRef.current) return;

    setIsLoading(true);
    setError(null);
    // console.log('Fetching channel data for:', channelName);
    try {
      const response = await fetch(`/api/yes/channel-info?channel_name=${channelName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`);
      }
      const data: ChannelData = await response.json();
      setChannelData(data);

      if (data && data.id) {
        setIsChannelActive(data.status === 'ACTIVE');
        setIsProcessing(data.isProcessing);
        fetchSessionBadges();
      }
    } catch (error) {
      console.error('Error fetching channel data:', error);
      setError('Failed to load channel data. Please try again later.');
    } finally {
      setIsLoading(false);
      fetchedRef.current = true;
    }
  }, [channelName, fetchSessionBadges]);

  const checkProcessingStatus = useCallback(async () => {
    if (!channelData?.id) return;
    try {
      const response = await fetch(`/api/bot/info?channelId=${channelData.id}`);
      console.log('Checking processing status for channel:', channelData.id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setIsProcessing(data.isProcessing);
      setIsChannelActive(data.isActive);
    } catch (error) {
      console.error('Error checking processing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check processing status. Please refresh the page.',
        variant: 'destructive',
      });
    }
  }, [channelData, toast]);

  const debouncedFetchChannelData = useDebouncedCallback(fetchChannelData, 100);

  useEffect(() => {
    debouncedFetchChannelData();
    return () => {
      debouncedFetchChannelData.cancel();
    };
  }, [debouncedFetchChannelData]);

  useEffect(() => {
    if (sessionId && channelData?.id) {
      checkProcessingStatus();
    }
  }, [sessionId, channelData, checkProcessingStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <FaRobot className="w-16 h-16 text-gray-500 dark:text-white animate-spin" />
        <div className="flex items-center space-x-2">
          <span className="text-2xl mr-2">Loading</span>
          <FaRobot className="w-8 h-8 text-gray-500 dark:text-white -mr-1 p-0" />
          <span className="text-3xl ml-0">{channelName}</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.log(error);
  }

  const channelInfo = channelData || defaultChannelData;

  return (
    <div className="min-h-screen">
      <Header />
      <ChannelHeader channelData={channelInfo} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isProcessing ? (
              <ChannelProcessing channelData={channelInfo} />
            ) : isChannelActive ? (
              <div className="mt-8">
                <ChatInterface channelData={channelInfo} />
                <DisclaimerSection />
              </div>
            ) : (
              <>
                <UnlockChannelChat channelData={channelInfo} onFundingUpdate={fetchChannelData} />
                <ShareChannelActivation channelData={channelInfo} />
              </>
            )}
          </div>
          <div>
            {isChannelActive && (
              <SponsorshipCTA channelData={channelInfo} />
            )}
            {isChannelActive && (
              <div className="mb-8">
                <FuelGauge 
                  creditBalance={channelInfo.creditBalance ?? 0}
                  maxCredits={100000} // Default or from a different source
                />
              </div>
            )}
            {isChannelActive && (
              <div className="mb-8 justify-center text-center">
                <Link href={`/collab`}>
                  <Button
                    className="bg-blue-700 hover:bg-blue-800 transition-all duration-300 ease-in-out transform hover:scale-110 text-white font-bold px-8 py-6 rounded-lg"
                  >
                    <Merge className="w-6 h-6 rotate-180 mr-2" />
                    Start New Collab
                  </Button>
                </Link>
              </div>
            )}
            {isChannelActive && false && (
              <BotAttributesPanel
                channelData={channelInfo}
                onActivate={fetchChannelData}
              />
            )}
            {isChannelActive && (
              <LeaderboardActivity channelData={channelInfo} />
            )}
            {!isChannelActive && !channelInfo.isProcessing && !isProcessing && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4">Explore active channels...</h2>
                <FeaturedChannels showStats={false} />
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
        sessionId={sessionId || ''}
        channelData={channelInfo}
        badges={earnedBadges}
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