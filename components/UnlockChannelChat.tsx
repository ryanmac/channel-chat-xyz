// app/components/UnlockChannelChat.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { Bot, Clock, Users, Award, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressBar from '@/components/ui/progress-bar';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/utils/stripePayments';
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
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [flashButtons, setFlashButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const botAnimation = useAnimation();

  const [fundingPercentage, setFundingPercentage] = useState(0);
  const [potentialPercentage, setPotentialPercentage] = useState(0);
  const [potentialExcessFunding, setPotentialExcessFunding] = useState(0);
  const fundingToGoal = goalFunding - currentFunding;

  useEffect(() => {
    // console.log('UnlockChannelChat: currentFunding:', currentFunding, 'goalFunding:', goalFunding);
    const percentage = (currentFunding / goalFunding) * 100;
    setFundingPercentage(percentage);
  }, [currentFunding, goalFunding]);

  useEffect(() => {
    const currentFundingPercentage = (currentFunding / goalFunding) * 100;
    const remainingFunding = goalFunding - currentFunding;
    const potentialContribution = Number(amount);
    const potentialPercentage = (potentialContribution / goalFunding) * 100;
    const totalPotentialFunding = currentFunding + potentialContribution;
    const totalPotentialFundingPercentage = (totalPotentialFunding / goalFunding) * 100;
    const potentialExcessFunding = Math.max(0, totalPotentialFunding - goalFunding);

    setFundingPercentage(currentFundingPercentage);
    setPotentialPercentage(potentialPercentage);
    setPotentialExcessFunding(potentialExcessFunding);

    // console.log('useEffect: UnlockChannelChat');
    // console.log('currentFunding:', currentFunding, 'is the current amount of funding');
    // console.log('goalFunding:', goalFunding, 'is the total amount of funding needed to reach the goal');
    // console.log('currentFundingPercentage:', currentFundingPercentage, 'is the amount of the goal that has been reached already');
    // console.log('remainingFunding:', remainingFunding, 'is the amount of the goal that still needs to be reached');
    // console.log('potentialContribution:', potentialContribution, 'is the amount that the user is considering contributing');
    // console.log('potentialPercentage:', potentialPercentage, 'is the percentage of the goal that the potentialContribution represents');
    // console.log('totalPotentialFunding:', totalPotentialFunding, 'is the total amount of funding that would be reached if the user contributes the potentialContribution');
    // console.log('totalPotentialFundingPercentage:', totalPotentialFundingPercentage, 'is the percentage of the goal that the totalPotentialFunding represents');
    // console.log('amount:', amount, 'is the current amount that the user is considering contributing');
    // console.log('fundingToGoal:', fundingToGoal, 'is the amount of funding that still needs to be reached to reach the goal');
    // console.log('The ProgressBar component should show 2 values: currentFundingPercentage (', currentFundingPercentage, ' in white) and potentialPercentage (', potentialPercentage, ' in pink)');
    // console.log('Excess funding is the amount of funding that exceeds the goal');
    // console.log('Potential excess funding is the amount of funding that would exceed the goal if the user contributes the potentialContribution');
    // console.log('Potential excess funding is', potentialExcessFunding, 'if the user contributes', potentialContribution);
  }, [currentFunding, amount, potentialPercentage, potentialExcessFunding, goalFunding, fundingToGoal]);

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
            Contribute {((activationContribution / goalFunding) * 100).toFixed(0)}% toward activating the channel for the community
          </li>
        )}
        {activationContribution > 0 && (remainingToActivate - numericAmount) <= 0 && (
          <>
            <li>
              <strong>Activate the channel for the community!</strong>
            </li>
          </>
        )}
        {extraContribution >= 0 && (
          <li>
            Add <strong>{((chatCount+1000)/1000).toLocaleString()}k</strong> chats for the community
          </li>
        )}
        {/* {activationContribution > 0 && extraContribution == 0 && (remainingToActivate - numericAmount) <= 0 && (
          <li>
            Add 1000 chats for the community to use
          </li>
        )} */}
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
          <div className={`mb-2 ${potentialExcessFunding >= 0 && (fundingPercentage + potentialPercentage) >= 100 ? 'flex items-center' : ''}`}>
            {/* Flex container if there is excess funding */}
            <div className={`flex-shrink ${potentialExcessFunding >= 0 && (fundingPercentage + potentialPercentage) >= 100 ? 'w-10/12' : 'w-full'}`}>
              <ProgressBar
                items={[
                  { value: fundingPercentage, className: 'bg-white' },
                  { value: potentialPercentage, className: 'bg-green-300' },
                ]}
                height='h-6'
              />
            </div>
            {potentialExcessFunding >= 0 && (fundingPercentage + potentialPercentage) >= 100 && (
              <div className="flex-shrink w-2/12 text-sm text-gray-200 font-semibold pl-2">
                +{potentialExcessFunding+1}k chats
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            ${currentFunding.toFixed(0)} raised so far toward ${goalFunding.toFixed(0)} activation goal
          </p>
        </div>
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
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Choose Your Contribution</h3>
            <Slider
              value={[Number(amount)]}
              onValueChange={(value: number[]) => setAmount(value[0])}
              min={1}
              max={100}
              step={1}
              className="mb-4"
              filledColor='bg-green-300'
            />
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${amount}</span>
            <Button
              onClick={() => handleSponsor(Number(amount))}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-110 text-white font-bold py-2 px-4 rounded" // to animate to 1.2x size on hover, add hover:scale-120
            >
              {isLoading
                ? "Processing..."
                : currentFunding + Number(amount) >= goalFunding
                ? "Activate Now!"
                : "Contribute"}
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
              <li>Activate the chatbot for {channelTitle}'s channel</li>
              <li><strong>5x</strong> chat response limits for <strong>ALL</strong> channels</li>
              <li>
                Help advance AI technology and research
                <Heart className="w-4 h-4 inline-block ml-1" />
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <Info className="w-4 h-4 inline-block mr-1" />
          A Chat roughly corresponds to about 29 book pages or 6 blog posts.{' '}
          Funds are used for AI model training, server costs, chats, and ongoing improvements.{' '}
          <Link href="/about">
            <span className="text-blue-500 hover:underline">Learn more</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}