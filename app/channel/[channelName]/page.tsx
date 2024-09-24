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
import { BotAttributesPanel } from '@/components/BotAttributesPanel';
import { FuelGauge } from '@/components/FuelGauge';
import { ShareChannelActivation } from '@/components/ShareChannelActivation';
import { ChannelProcessing } from '@/components/ChannelProcessing';
import { SuccessShareModal } from '@/components/SuccessShareModal';
import { SignUpModal } from '@/components/SignUpModal';
import { BadgeType } from '@/utils/badgeManagement';
import { ChannelData } from '@/utils/channelManagement';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/next-auth/auth-provider'; // Ensure correct import
import { defaultChannelData } from '@/constants/channelData';
import { getCache, setCache } from '@/utils/cache';
import { Merge } from 'lucide-react';
import { FaRobot } from "react-icons/fa6";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useBadgeTransfer } from '@/hooks/useBadgeTransfer';
import Image from 'next/image'

interface ChannelPageProps {
  params: {
    channelName: string;
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  const { session, status } = useSession(); // Correct usage of useSession
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

  useBadgeTransfer(sessionId, session?.user?.id);

  const fetchSessionBadges = useCallback(async () => {
    if (!sessionId || !channelData?.id) return;

    const userId = session?.user?.id;
    const channelId = channelData.id;

    const cacheKey = `session_badges:${sessionId}_${channelId}_${userId || 'guest'}`;
    const cachedData = getCache(cacheKey);
    let badgesArray: BadgeType[] = [];

    try {
      if (cachedData) {
        setEarnedBadges(cachedData);
        badgesArray = cachedData;
      } else {
        const queryParams = new URLSearchParams({
          sessionId,
          channelId,
        });

        if (userId) {
          queryParams.append('userId', userId);
        }

        const response = await fetch(`/api/badges/session?${queryParams.toString()}`);
        if (!response.ok) {
          console.log('Failed to fetch session badges:', response.status, response.statusText);
          // throw new Error(`Failed to fetch session badges: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        badgesArray = data.badges ? data.badges : [];
        setEarnedBadges(badgesArray as BadgeType[]);
        setCache(cacheKey, badgesArray, 30); // Cache for 30 seconds
      }
      console.log('Session badges:', badgesArray.length > 0 ? badgesArray.join(', ') : 'No badges earned');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error fetching session badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch session badges. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [sessionId, channelData, session?.user?.id, toast]);

  const fetchChannelData = useCallback(async () => {
    if (fetchedRef.current) return;

    setIsLoading(true);
    setError(null);
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
        if (!isProcessing) {
          if (data.interests.length === 0) {
            console.log('No interests found for channel:', data.name);
            const response = fetch(`/api/channel/interests`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channelData: { id: data.id, name: data.name } }),
            });
          }
        }
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

  useEffect(() => {
    if (sessionId && channelData?.id) {
      fetchSessionBadges();
    }
  }, [sessionId, channelData, fetchSessionBadges]);

  const checkProcessingStatus = useCallback(async () => {
    if (!channelData?.id) return;
    try {
      const response = await fetch(`/api/channel/info?channelId=${channelData.id}`);
      console.log('Checking processing status for channel:', channelData.id);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setIsProcessing(data.isProcessing);
      setIsChannelActive(data.status === 'ACTIVE');
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
        {/* <FaRobot className="w-16 h-16 text-gray-500 dark:text-white animate-spin" /> */}
        <Image
          src="/logomark-play2.png"
          alt="ChannelChat Logo"
          width={200}
          height={200}
          className="mr-2 h-[200px] w-auto"
        />
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
                  maxCredits={100000}
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
        userImageUrl={session?.user?.image || ''}
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