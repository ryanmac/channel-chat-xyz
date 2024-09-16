// components/UnlockChannelChat.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { Bot, Users, Heart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressBar from '@/components/ui/progress-bar';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/utils/stripePayments';
import { BadgeComponent } from '@/components/BadgeComponent';
import { determineBadges, BadgeType } from '@/utils/badgeManagement';
import { ChannelData } from '@/utils/channelManagement';
import { FaRobot } from "react-icons/fa6";

interface UnlockChannelChatProps {
  channelData: ChannelData | null;
  onFundingUpdate: () => void;
}

interface Contributor {
  name: string;
  avatar: string;
}

export function UnlockChannelChat({ channelData, onFundingUpdate }: UnlockChannelChatProps) {
  const [activationFunding, setActivationFunding] = useState(channelData?.activationFunding || 0); // Corrected state variable
  const [amount, setAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [sliderMoved, setSliderMoved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [potentialPercentage, setPotentialPercentage] = useState(0);
  const [potentialExcessFunding, setPotentialExcessFunding] = useState(0);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const botAnimation = useAnimation();

  useEffect(() => {
    // Fetch the latest funding status when the component mounts or the sessionId changes
    const fetchLatestFunding = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/channel/funding?channelId=${channelData?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch latest funding');
        }
        const data = await response.json();
        setActivationFunding(data.channelData.activationFunding);
        onFundingUpdate();
      } catch (error) {
        console.error('Error fetching latest funding:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch latest funding information.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (channelData) {
      fetchLatestFunding();
    }
  }, [channelData, onFundingUpdate]);

  useEffect(() => {
    const calculateFundingImpact = () => {
      const numericAmount = Number(amount);
      const remainingToActivate = Math.max(0, (channelData?.activationGoal || 0) - activationFunding);
      const activationContribution = Math.min(numericAmount, remainingToActivate);
      const potentialPercentage = (activationContribution / (channelData?.activationGoal || 1)) * 100;
      const potentialExcessFunding = Math.max(0, numericAmount - activationContribution);

      setPotentialPercentage(potentialPercentage);
      setPotentialExcessFunding(potentialExcessFunding);
    };

    calculateFundingImpact();
  }, [amount, channelData, activationFunding]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX / window.innerWidth - 0.5) * 20;
      const moveY = (clientY / window.innerHeight - 0.5) * 20;
      botAnimation.start({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [botAnimation]);

  const handleSponsor = async (selectedAmount: number) => {
    if (isNaN(selectedAmount) || selectedAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await createCheckoutSession(channelData?.id || '', channelData?.name || '', selectedAmount);
      onFundingUpdate();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmountSponsor = () => {
    const selectedAmount = Number(customAmount);
    handleSponsor(selectedAmount);
  };

  const calculateContributionImpact = () => {
    const numericAmount = Number(amount);
    const remainingToActivate = Math.max(0, (channelData?.activationGoal || 0) - activationFunding);
    const activationContribution = Math.min(numericAmount, remainingToActivate);
    const extraContribution = Math.max(0, numericAmount - activationContribution);
    const badgeTypes = determineBadges(
      numericAmount,
      (channelData?.activationGoal || 0) - activationFunding,
      remainingToActivate,
      contributors.length === 0,
      {
        totalChats: 0,
        shares: 0,
        daysActive: 0,
        earlyMorningChats: 0,
        lateNightChats: 0,
        uniqueChannels: 0,
        uniqueQueries: 0,
        longConversations: 0,
        conversationsStarted: 0,
        factChecks: 0,
        trendingConversations: 0,
        complexQueries: 0,
      }
    );

    return (
      <ul className="list-disc list-inside text-sm">
        {activationContribution > 0 && remainingToActivate - numericAmount > 0 && (
          <li>
            Contribute {((activationContribution / (channelData?.activationGoal || 1)) * 100).toFixed(0)}% toward
            activating the channel for the community
          </li>
        )}
        {activationContribution > 0 && remainingToActivate - numericAmount <= 0 && (
          <li>
            <strong>Activate the channel for the community!</strong>
          </li>
        )}
        {extraContribution >= 0 && (
          <li>
            Add <strong>{(Math.floor(extraContribution * 1000) / 1000).toLocaleString()}k</strong> chats for the
            community
          </li>
        )}
        {badgeTypes.length > 0 && (
          <li>
            Earn badges:
            <div className="flex flex-wrap mt-2">
              {badgeTypes.map((type) => (
                <BadgeComponent key={type} type={type} />
              ))}
            </div>
          </li>
        )}
      </ul>
    );
  };

  return (
    <Card className="w-full mt-8 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white relative">
        <CardTitle className="text-3xl font-bold text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Activate {channelData?.title}'s Chatbot
            <motion.div animate={botAnimation} className="absolute top-4 right-4">
              <FaRobot className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Progress to Activation</h3>
          <div className="mb-2">
            <ProgressBar
              items={[
                { value: (activationFunding / (channelData?.activationGoal || 1)) * 100, className: 'bg-white' },
                ...(sliderMoved ? [{ value: potentialPercentage, className: 'bg-green-300' }] : []),
              ]}
              height="h-6"
            />
          </div>
          <p className="text-sm text-gray-600">
            ${activationFunding.toFixed(0)} raised so far toward ${(channelData?.activationGoal || 0).toFixed(0)}{' '}
            activation goal
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Join Our Sponsors</h3>
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-500" />
            <span className="mr-2">
              {contributors.length > 0
                ? `Join ${contributors.length} others who've already contributed!`
                : 'Be the first to contribute!'}
            </span>
            {contributors.length > 0 && (
              <div className="flex -space-x-2">
                {contributors.map((contributor, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={contributor.avatar} alt={contributor.name} />
                          <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{contributor.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Choose Your Contribution</h3>
          <Slider
            value={[Number(amount)]}
            onValueChange={(value: number[]) => {
              setAmount(value[0]);
              if (!sliderMoved) setSliderMoved(true);
            }}
            min={1}
            max={100}
            step={1}
            className="mb-4"
            filledColor="bg-green-300"
          />
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${amount}</span>
            <Button
              onClick={() => handleSponsor(Number(amount))}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-110 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading
                ? 'Processing...'
                : activationFunding + Number(amount) >= (channelData?.activationGoal || 0)
                ? 'Activate Now!'
                : 'Contribute'}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Impact</h3>
            {calculateContributionImpact()}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Why Sponsor?</h3>
            <ul className="list-disc list-inside text-sm">
              <li>Activate the chatbot for {channelData?.title}'s channel</li>
              <li>
                <strong>5x</strong> chat response limits for <strong>ALL</strong> channels
              </li>
              <li>
                Help advance AI technology and research
                <Heart className="w-4 h-4 inline-block ml-1" />
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <Info className="w-4 h-4 inline-block mr-1" />
          A Chat roughly corresponds to about 29 book pages or 6 blog posts. Funds are used for AI model training,
          server costs, chats, and ongoing improvements.{' '}
          <Link href="/about">
            <span className="text-blue-500 hover:underline">Learn more</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}