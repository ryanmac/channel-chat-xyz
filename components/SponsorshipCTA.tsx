// components/SponsorshipCTA.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bot, MessageSquare } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/utils/stripePayments";
import { ChannelData } from '@/utils/channelManagement';
import { FaR, FaRobot } from "react-icons/fa6";

interface SponsorshipCTAProps {
  channelData: ChannelData;
}

export function SponsorshipCTA({ channelData }: SponsorshipCTAProps) {
  const [sliderValue, setSliderValue] = useState([10]); // Default to $10
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSliderChange = useCallback((value: number[]) => {
    setSliderValue(value);
  }, []);

  const handleSponsor = async () => {
    const sponsorAmount = sliderValue[0];
    setIsLoading(true);

    try {
      await createCheckoutSession(channelData, sponsorAmount);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sponsorAmount = sliderValue[0];
  const chatsSponsored = sponsorAmount * 1000; // 1 dollar sponsors 1000 chats

  return (
    <Card className="w-full mb-8 mt-8 bg-background/80 border-none">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white relative mb-4 rounded-t-lg">
        <CardTitle>
          <p className="font-semibold flex items-center">
            Sponsor {channelData.title} Chats
            <FaRobot className="w-6 h-6 text-white ml-2" />
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Every dollar sponsors 1000 AI-powered chats!</p>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          min={1}
          max={100}
          step={1}
          className="mb-6"
        />
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold">${sponsorAmount}</span>
          <span className="text-xl font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            {chatsSponsored.toLocaleString()} Chats
          </span>
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            onClick={handleSponsor}
            disabled={isLoading}
            className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-105 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Processing...' : `Sponsor ${chatsSponsored.toLocaleString()} Chats for $${sponsorAmount}`}
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Every dollar sponsors 1,000 AI-powered chats for the community!
        </p>
      </CardContent>
    </Card>
  );
}