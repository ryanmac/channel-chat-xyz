// components/SponsorshipCTA.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/utils/stripePayments";

interface SponsorshipCTAProps {
  channelName: string;
  channelTitle: string;
  channelId: string;
}

export function SponsorshipCTA({ channelName, channelTitle, channelId }: SponsorshipCTAProps) {
  const [fuelData, setFuelData] = useState({ percentage: 0, credits: 0 });
  const [sliderValue, setSliderValue] = useState([5]); // Start at $5
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const maxFunding = 100; // Maximum funding percentage
  const currentFunding = Math.round((fuelData.percentage * maxFunding) / 100); // Calculate current funding from the percentage

  useEffect(() => {
    async function fetchFuelData() {
      if (!channelId) {
        setError('Channel ID is missing');
        return;
      }

      try {
        const response = await fetch(`/api/fuel/info?channelid=${channelId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fuel data');
        }
        const data = await response.json();
        setFuelData(data);
        setSliderValue([Math.max(Math.round(data.percentage) + 1, 5)]); // Ensure slider starts at $5 or $1 above current funding
      } catch (err) {
        console.error('Error fetching fuel data:', err);
        setError('Failed to load fuel data');
      }
    }
    fetchFuelData();
  }, [channelId]);

  const handleSliderChange = useCallback((value: number[]) => {
    const newValue = Math.max(value[0], currentFunding + 1); // Ensure slider doesn't move below $1 greater than current funding
    setSliderValue([Math.min(newValue, maxFunding)]); // Prevent going above max funding
  }, [currentFunding, maxFunding]); // Memoize with dependency array

  const handleSponsor = async () => {
    const sponsorAmount = sliderValue[0] - currentFunding; // Calculate the amount to sponsor using the first element of the array
    if (sponsorAmount <= 0) {
      setError('Please increase the funding amount to sponsor');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createCheckoutSession(channelId, channelName, sponsorAmount);
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

  const sponsorAmount = sliderValue[0] - currentFunding;
  const chatsSponsored = sponsorAmount; // 1 dollar sponsors 1000 chats

  return (
    <Card className="w-full mb-8">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white relative mb-4">
        <CardTitle>
          <p className="font-semibold flex items-center">
            Sponsor {channelTitle}
            <Bot className="w-6 h-6 text-gray-500 dark:text-white ml-0 mr-2" />
            Chats
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Keep this chatbot running by sponsoring chats</p>
        <Slider
          value={sliderValue} // Pass the array
          onValueChange={handleSliderChange} // Use memoized function
          max={maxFunding}
          step={1}
          className="mb-6"
        />
        <p className="text-sm text-gray-400 mb-4 flex items-center">
          {currentFunding}% Funded - Help {channelTitle}
          <Bot className="w-4 h-4 text-gray-400 dark:text-gray-400 ml-0 mr-2" />
          Reach 100%!
        </p>
        <div className="w-full flex justify-center items-center">
          <Button
            onClick={handleSponsor}
            disabled={isLoading || sponsorAmount <= 0}
            className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 transition-all duration-300 ease-in-out transform hover:scale-110 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Processing...' : `Sponsor ${chatsSponsored}k Chats for $${sponsorAmount}`}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {/* <p className="mt-4 text-sm text-gray-600">
          Feed the bot to keep it running strong.
        </p> */}
      </CardContent>
    </Card>
  );
}