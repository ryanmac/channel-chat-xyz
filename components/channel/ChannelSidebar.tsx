// components/channel/ChannelSidebar.tsx
import React from 'react';
import { SponsorshipCTA } from '@/components/SponsorshipCTA';
import { FuelGauge } from '@/components/FuelGauge';
import { LeaderboardActivity } from '@/components/LeaderboardActivity';
import { FeaturedChannels } from '@/components/FeaturedChannels';
import { useChannelPageContext } from '@/components/providers/ChannelPageProvider';

export const ChannelSidebar: React.FC = () => {
  const { channelData, isChannelActive, isProcessing } = useChannelPageContext();

  if (!isChannelActive && !isProcessing) {
    return (
      <>
        <h2 className="text-2xl font-bold mt-8 mb-4">Explore other chatbots...</h2>
        <FeaturedChannels showStats={false} />
      </>
    );
  }

  return (
    <>
      {isChannelActive && channelData && (
        <SponsorshipCTA channelData={channelData} />
      )}
      {isChannelActive && channelData && (
        <div className="mb-8">
          <FuelGauge creditBalance={channelData.creditBalance} maxCredits={10000} />
        </div>
      )}
      {isChannelActive && channelData && (
        <LeaderboardActivity channelData={channelData} />
      )}
    </>
  );
};