// components/BotAttributesPanel.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemoryDisplay } from '@/components/MemoryDisplay';
import { ModelInfo } from '@/components/ModelInfo';
import { ChatStats } from '@/components/ChatStats';
import { FuelGauge } from '@/components/FuelGauge';
import { FineTuningStatus } from '@/components/FineTuningStatus';
import { BotScore } from '@/components/BotScore';
import { createCheckoutSession } from "@/utils/stripePayments";
import { Loader2 } from 'lucide-react';
import { BotAttributes } from '@/utils/botManagement';

interface BotAttributesPanelProps {
  channelId: string;
  botTier: string;
  isActive: boolean;
  onActivate: () => Promise<void>;
}

export function BotAttributesPanel({ 
  channelId, 
  botTier, 
  isActive, 
  onActivate 
}: BotAttributesPanelProps) {
  const [botAttributes, setBotAttributes] = useState<BotAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBotAttributes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bot/info?channelId=${channelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bot info');
      }
      const data = await response.json();
      setBotAttributes(data);
    } catch (err) {
      console.error('Error fetching bot info:', err);
      setError('Failed to load bot attributes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBotAttributes();
  }, [channelId]);

  const handleBoost = async (type: 'memory' | 'model' | 'fineTuning') => {
    try {
      const amount = 10; // Example amount, adjust as needed
      await createCheckoutSession(channelId, `Boost ${type}`, amount);
      // Refresh bot attributes after successful boost
      await fetchBotAttributes();
    } catch (err) {
      console.error(`Failed to boost ${type}:`, err);
      setError(`Failed to boost ${type}`);
    }
  };

  const handleRefuel = async () => {
    try {
      const amount = 50; // Example amount for refueling
      await createCheckoutSession(channelId, 'Refuel credits', amount);
      // Refresh bot attributes after successful refuel
      await fetchBotAttributes();
    } catch (err) {
      console.error('Failed to refuel:', err);
      setError('Failed to refuel');
    }
  };

  if (isLoading) return (
    <Card className="w-full p-6 mb-8 flex flex-col items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin mb-2" />
      <span className="text-center">Loading bot attributes...</span>
    </Card>
  );

  if (error) return <Card className="w-full p-6 mb-8 text-red-500">Error: {error}</Card>;

  if (!botAttributes) return null;

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Stats: {botAttributes.tier}</span>
          <Button 
            variant={botAttributes.isActive ? "secondary" : "default"}
            onClick={onActivate}
          >
            {botAttributes.isActive ? "Active" : "Activate"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BotScore score={botAttributes.botScore} />
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <MemoryDisplay
            totalEmbeddings={botAttributes.totalEmbeddings}
            totalEmbeddedVideos={botAttributes.totalEmbeddedVideos}
            totalChannelVideos={botAttributes.totalChannelVideos}
            onBoost={() => handleBoost('memory')}
          />
          <ModelInfo 
            model={botAttributes.model}
            maxTokens={botAttributes.maxTokens}
            onBoost={() => handleBoost('model')}
          />
          <ChatStats chatsCreated={botAttributes.chatsCreated} />
          <FuelGauge 
            creditBalance={botAttributes.creditBalance}
            maxCredits={botAttributes.maxCredits}
          />
          <FineTuningStatus 
            isFineTuned={botAttributes.isFineTuned}
            onToggleFineTuning={() => handleBoost('fineTuning')}
          />
        </div>
      </CardContent>
    </Card>
  );
}