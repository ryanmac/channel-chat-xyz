// components/channel/ChannelContent.tsx
import React from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { UnlockChannelChat } from '@/components/UnlockChannelChat';
import { ShareChannelActivation } from '@/components/ShareChannelActivation';
import { ChannelProcessing } from '@/components/ChannelProcessing';
import { DisclaimerSection } from '@/components/DisclaimerSection';
import { useChannelPageContext } from '@/components/providers/ChannelPageProvider';
import { useChannelData } from '@/hooks/useChannelData';

export const ChannelContent: React.FC = () => {
  const { channelData } = useChannelPageContext();
  const { fetchChannelData } = useChannelData(channelData?.name || '');

  if (channelData?.isProcessing) {
    return <ChannelProcessing channelData={channelData} />;
  }

  if (channelData?.status === 'ACTIVE') {
    return (
      <div>
        <ChatInterface channelData={channelData} />
        <DisclaimerSection />
      </div>
    );
  }

  return (
    <>
      <UnlockChannelChat channelData={channelData} onFundingUpdate={fetchChannelData} />
      <ShareChannelActivation channelData={channelData} />
    </>
  );
};