// app/components/SponsorshipCTA.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/utils/stripePayments";

interface SponsorshipCTAProps {
  channelName: string;
  channelTitle: string;
  channelId: string;
}

export function SponsorshipCTA({ channelName, channelTitle, channelId }: SponsorshipCTAProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [fuelData, setFuelData] = useState({ percentage: 0, credits: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashButtons, setFlashButtons] = useState(false);
  const { toast } = useToast();

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
      } catch (err) {
        console.error('Error fetching fuel data:', err);
        setError('Failed to load fuel data');
      }
    }
    fetchFuelData();
  }, [channelId]);

  const handleSponsor = async (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setFlashButtons(true);
      setTimeout(() => setFlashButtons(false), 1000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createCheckoutSession(channelId, channelName, amount);
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

  const handleCustomAmountSponsor = () => {
    const amount = Number(customAmount);
    if (!customAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid custom amount');
      setFlashButtons(true);
      setTimeout(() => setFlashButtons(false), 1000);
    } else {
      handleSponsor(amount);
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>
          <p className="font-semibold flex items-center">
            Sponsor {channelTitle}
            <Bot className="w-6 h-6 text-gray-500 dark:text-white ml-0 mr-2" />
            Chats
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Help keep this chatbot running by sponsoring chats.</p>
        <Progress value={fuelData.percentage} className="mb-2" />
        <p className="text-sm text-gray-600 mb-4">
          {fuelData.percentage.toFixed(0)}% Funded - Help {channelTitle} Reach 100%!
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {[5, 10, 20].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              onClick={() => handleSponsor(amount)}
              className={flashButtons ? 'animate-pulse bg-primary/10' : ''}
              disabled={isLoading}
            >
              ${amount}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            type="number"
            placeholder="Custom amount"
            className="w-36"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min={1}
            step={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleCustomAmountSponsor}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Sponsor Custom Amount'}
          </Button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p className="mt-4 text-sm text-gray-600">
          $1 sponsors 1000 chats. Fuel up the chatbot to keep it running!
        </p>
      </CardContent>
    </Card>
  );
}