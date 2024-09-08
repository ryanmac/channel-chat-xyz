// app/components/UnlockChannelChat.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { Bot, Clock, Users, Award, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/utils/stripePayments';
import { getFuelPercentage } from '@/utils/creditManagement';
import { BadgeComponent, determineBadges, BadgeType } from '@/components/BadgeComponent';

interface UnlockChannelChatProps {
  channelName: string;
  channelTitle: string;
  channelId: string;
  currentFunding: number;
  goalFunding: number;
  onFundingUpdate: () => void;
}

interface Contributor {
  name: string;
  avatar: string;
}

export function UnlockChannelChat({
  channelName,
  channelTitle,
  channelId,
  currentFunding,
  goalFunding,
  onFundingUpdate,
}: UnlockChannelChatProps) {
  const [amount, setAmount] = useState<number | string>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fuelPercentage, setFuelPercentage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [flashButtons, setFlashButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const botAnimation = useAnimation();

  const [fundingPercentage, setFundingPercentage] = useState(0);
  const fundingToGoal = goalFunding - currentFunding;

  useEffect(() => {
    console.log('UnlockChannelChat: currentFunding:', currentFunding, 'goalFunding:', goalFunding);
    const percentage = (currentFunding / goalFunding) * 100;
    setFundingPercentage(percentage);
  }, [currentFunding, goalFunding]);

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
      setFlashButtons(true);
      setTimeout(() => setFlashButtons(false), 1000);
      return;
    }
    setIsLoading(true);
    try {
      await createCheckoutSession(channelId, channelName, selectedAmount);
      // After successful payment, update the funding
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
  }

  const handleCustomAmountSponsor = () => {
    const selectedAmount = Number(customAmount);
    handleSponsor(selectedAmount);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateContributionImpact = () => {
    const numericAmount = Number(amount);
    const remainingToActivate = Math.max(0, fundingToGoal);
    const activationContribution = Math.min(numericAmount, remainingToActivate);
    const extraContribution = Math.max(0, numericAmount - activationContribution);
    const chatCount = Math.floor(extraContribution * 1000);
    const isFirstSponsor = contributors.length === 0;
    const userStats = {
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
    };
  
    const badgeTypes = determineBadges(numericAmount, fundingToGoal, remainingToActivate, isFirstSponsor, userStats);
  
    return (
      <ul className="list-disc list-inside text-sm">
        {activationContribution > 0 && (remainingToActivate - numericAmount) > 0 && (
          <li>
            {/* Contribute ${activationContribution.toFixed(0)} toward the ${fundingToGoal.toFixed(0)} goal to activate the
            channel for the community */}
            {/* To change these to %, use this: */}
            Contribute {((activationContribution / goalFunding) * 100).toFixed(0)}% toward the ${fundingToGoal.toFixed(0)} goal to activate the channel for the community
          </li>
        )}
        {activationContribution > 0 && (remainingToActivate - numericAmount) <= 0 && (
          <>
            <li>
              <strong>Activate the channel for the community!</strong>
            </li>
          </>
        )}
        {extraContribution > 0 && (
          <li>
            Contribute ${extraContribution.toFixed(0)} to buy {chatCount.toLocaleString()} chats for the community
          </li>
        )}
        {activationContribution > 0 && extraContribution == 0 && (remainingToActivate - numericAmount) <= 0 && (
          <li>
            Add 1000 chats to the community
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
            Activate {channelTitle}'s Chatbot
            <motion.div animate={botAnimation} className="absolute top-4 right-4">
              <Bot className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Progress to Activation</h3>
          <Progress value={fundingPercentage} className="h-4 mb-2" />
          <p className="text-sm text-gray-600">
            ${currentFunding.toFixed(0)} raised of ${goalFunding.toFixed(0)} goal
          </p>
        </div>

        {/* <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Time Left to Activate</h3>
          <div className="flex items-center">
            <Clock className="w-6 h-6 mr-2 text-yellow-500" />
            <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div> */}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Join Our Sponsors</h3>
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-500" />
            <span className="mr-2">
              {contributors.length > 0
                ? `Join ${contributors.length} others who've already contributed!`
                : "Be the first to contribute!"}
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
        {/* <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Sponsorship Tiers</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto text-bronze-500" />
              <p className="font-semibold">Bronze</p>
              <p className="text-sm">$5 - 100 tokens</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto text-silver-500" />
              <p className="font-semibold">Silver</p>
              <p className="text-sm">$10 - 250 tokens</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto text-gold-500" />
              <p className="font-semibold">Gold</p>
              <p className="text-sm">$20 - 600 tokens</p>
            </div>
          </div>
        </div> */}

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Choose Your Contribution</h3>
            <Slider
              value={[Number(amount)]}
              onValueChange={(value: number[]) => setAmount(value[0])}
              min={1}
              max={100}
              step={1}
              className="mb-4"
            />
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${amount}</span>
            <Button
              onClick={() => handleSponsor(Number(amount))}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? 'Processing...' : 'Activate Now!'}
            </Button>
          </div>
        </div>

        {/* <div className="flex flex-wrap gap-2 mb-4">
          {[5, 10, 20].map((fixedAmount) => (
            <Button
              key={fixedAmount}
              variant="outline"
              onClick={() => handleSponsor(fixedAmount)}
              className={flashButtons ? 'animate-pulse bg-primary/10' : ''}
              disabled={isLoading}
            >
              ${fixedAmount}
            </Button>
          ))}
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min={1}
            step={1}
            className="w-24"
            disabled={isLoading}
          />
          <Button onClick={handleCustomAmountSponsor} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Sponsor Custom Amount'}
          </Button>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Impact</h3>
            {calculateContributionImpact()}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Why Sponsor?</h3>
            <ul className="list-disc list-inside text-sm">
              <li>Activate the chatbot for {channelTitle}'s channel</li>
              <li>Extended chat limits for ALL ChannelChat chatbots</li>
              <li>
                Help advance AI technology and research
                <Heart className="w-4 h-4 inline-block ml-1" />
              </li>
            </ul>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <Info className="w-4 h-4 inline-block mr-1" />
          Funds are used for AI model training, server costs, chats, and ongoing improvements.{' '}
          <Link href="/about">
            <span className="text-blue-500 hover:underline">Learn more</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}