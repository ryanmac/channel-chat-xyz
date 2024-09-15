// components/providers/ChannelPageProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { ChannelData } from '@/utils/channelManagement';
import { BotData } from '@/utils/botManagement';

interface ChannelPageContextType {
  channelData: ChannelData | null;
  botData: BotData;
  isChannelActive: boolean;
  isProcessing: boolean;
  currentFunding: number;
  setChannelData: (data: ChannelData | null) => void;
  setBotData: (data: BotData) => void;
  setIsChannelActive: (active: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setCurrentFunding: (funding: number) => void;
}

const ChannelPageContext = createContext<ChannelPageContextType | undefined>(undefined);

export const ChannelPageProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [botData, setBotData] = useState<BotData>({
    tier: 'Inactive',
    isActive: false,
    boosts: [],
    embeddedTranscripts: 0,
    totalVideos: 0,
    model: 'gpt-4o-mini',
    maxTokens: 200,
    chatsCreated: 0,
    creditBalance: 0,
    maxCredits: 1000,
    botScore: 0
  });
  const [isChannelActive, setIsChannelActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFunding, setCurrentFunding] = useState(0);

  return (
    <ChannelPageContext.Provider
      value={{
        channelData,
        botData,
        isChannelActive,
        isProcessing,
        currentFunding,
        setChannelData,
        setBotData,
        setIsChannelActive,
        setIsProcessing,
        setCurrentFunding,
      }}
    >
      {children}
    </ChannelPageContext.Provider>
  );
};

export const useChannelPageContext = () => {
  const context = useContext(ChannelPageContext);
  if (context === undefined) {
    throw new Error('useChannelPageContext must be used within a ChannelPageProvider');
  }
  return context;
};