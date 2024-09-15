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
import { ChannelData } from '@/utils/channelManagement';

interface BotAttributesPanelProps {
  channelData: ChannelData;
  onActivate: () => Promise<void>;
}

export function BotAttributesPanel({ channelData, onActivate }: BotAttributesPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBoost = async (type: 'memory' | 'model' | 'fineTuning') => {
    try {
      const amount = 10; // Example amount, adjust as needed
      await createCheckoutSession(channelData.id, `Boost ${type}`, amount);
      // Fetch updated channel data after boosting (omitted for simplicity)
    } catch (err) {
      console.error(`Failed to boost ${type}:`, err);
      setError(`Failed to boost ${type}`);
    }
  };

  const handleRefuel = async () => {
    try {
      const amount = 50; // Example amount for refueling
      await createCheckoutSession(channelData.id, 'Refuel credits', amount);
      // Fetch updated channel data after refueling (omitted for simplicity)
    } catch (err) {
      console.error('Failed to refuel:', err);
      setError('Failed to refuel');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-6 mb-8 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <span className="text-center">Loading channel attributes...</span>
      </Card>
    );
  }

  if (error) {
    return <Card className="w-full p-6 mb-8 text-red-500">Error: {error}</Card>;
  }

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Stats: {channelData.status}</span>
          <Button 
            variant={channelData.status === 'ACTIVE' ? "secondary" : "default"}
            onClick={onActivate}
          >
            {channelData.status === 'ACTIVE' ? "Active" : "Activate"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <BotScore score={channelData.creditBalance || 0} />
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <MemoryDisplay
            totalEmbeddings={channelData.totalEmbeddings}
            totalEmbeddedVideos={channelData.totalVideos} // Assuming equivalent to total embedded videos
            totalChannelVideos={channelData.totalVideos}
            onBoost={() => handleBoost('memory')}
          />
          <ModelInfo 
            model={channelData.model}
            maxTokens={channelData.maxTokens}
            onBoost={() => handleBoost('model')}
          />
          <ChatStats chatsCreated={channelData.chatsCreated} />
          <FuelGauge 
            creditBalance={channelData.creditBalance}
            maxCredits={100000} // Use a default or a dynamic value if available
          />
          <FineTuningStatus 
            isFineTuned={channelData.isFineTuned}
            onToggleFineTuning={() => handleBoost('fineTuning')}
          />
        </div>
      </CardContent>
    </Card>
  );
}