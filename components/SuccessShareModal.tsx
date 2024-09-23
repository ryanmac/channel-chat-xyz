// components/SuccessShareModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, Facebook, Linkedin, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BadgeComponent } from '@/components/BadgeComponent';
import { BadgeType } from '@/utils/badgeManagement';
import Confetti from 'react-confetti';
import { useToast } from '@/hooks/use-toast';
import { ChannelData } from '@/utils/channelManagement';
import { FaRobot } from 'react-icons/fa6';

interface SuccessShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  channelData: ChannelData;
  badges: BadgeType[];
  userImageUrl?: string;
}

interface TransactionData {
  activationAmount: number;
  creditPurchaseAmount: number;
  totalAmountInDollars: number;
  remainingToActivate: number;
  wasActivatedThisSession: boolean; // New flag to track if activation happened in this session
}

export const SuccessShareModal: React.FC<SuccessShareModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  channelData,
  badges,
  userImageUrl
}) => {
  const userImage = userImageUrl || '/images/default-avatar.png';
  const [isClient, setIsClient] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (sessionId) {
      fetchTransactionData();
    }
  }, [sessionId]);

  const fetchTransactionData = async () => {
    try {
      const response = await fetch(`/api/transactions?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction data');
      }
      const data = await response.json();
      // Add logic to determine if the activation occurred during this session
      const wasActivatedThisSession = data.activationAmount > 0 && data.remainingToActivate <= 0;
      setTransactionData({ ...data, wasActivatedThisSession });
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction data. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen || !transactionData) return null;

  const { activationAmount, creditPurchaseAmount, totalAmountInDollars, remainingToActivate, wasActivatedThisSession } = transactionData;
  const wasActivated = remainingToActivate <= 0;

  // Adjust newChatCreditsAdded to only include the initial 1000 credits if activation happened this session
  // const newChatCreditsAdded = creditPurchaseAmount + (wasActivatedThisSession ? 1000 : 0);
  const newChatCreditsAdded = creditPurchaseAmount;

  const determineShareMessage = (): string => {
    if (wasActivatedThisSession) {
      const activationMessages = [
        `I just activated @${channelData.name} AI 🤖 on @ChannelChatXYZ and sponsored ${newChatCreditsAdded.toLocaleString()} chats!\n\nThe AI is trained on ${channelData.title} transcripts. Try it out! No account required.\n\n`,
        `I just activated AI @${channelData.name} 🤖 on @ChannelChatXYZ and sponsored ${newChatCreditsAdded.toLocaleString()} chats!\n\nChat with AI trained on ${channelData.title} transcripts. Try it out!\n\n`,
      ];
      return activationMessages[Math.floor(Math.random() * activationMessages.length)];
    } else if (badges.includes('founding') || newChatCreditsAdded == 0) {
      return `I just contributed to @${channelData.name} AI on @ChannelChatXYZ!\n\nOnly $${remainingToActivate.toFixed(
        0
      )} more to activate an AI trained on ${channelData.title} transcripts!\n\n`;
    } else {
      return `I just sponsored ${newChatCreditsAdded.toLocaleString()} chats for @${channelData.title}'s AI on @ChannelChatXYZ!\n\nNow you can try it out for free! It's trained on ${channelData.name}'s transcripts.\n\n`;
    }
  };

  const shareMessage = determineShareMessage();
  const currentUrl = `https://channelchat.xyz/channel/@${channelData.name}`;

  const safeShareMessage: string = typeof shareMessage === 'string' ? shareMessage : String(shareMessage);
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent('I Activated an AI Chatbot!')}&summary=${encodeURIComponent(safeShareMessage)}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = () => {
    if (isClient) {
      navigator.clipboard.writeText(`${shareMessage} ${currentUrl}`).then(() => {
        toast({
          title: 'Copied to clipboard',
          description: 'The share message has been copied to your clipboard.',
        });
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Failed to copy',
          description: 'There was an error copying the message. Please try again.',
          variant: 'destructive',
        });
      });
    }
  };

  const renderModalContent = () => (
    <>
      <h2 className="text-4xl font-extrabold text-center mb-6 mt-4">
        {wasActivatedThisSession ? 'Congratulations! 🎉' : 'Kudos! 🎉'}
      </h2>
      {wasActivatedThisSession ? (
        <p className="text-2xl text-center mb-8 font-medium">
          You successfully activated
          <span className="inline whitespace-nowrap">
            <FaRobot className="inline h-6 w-6 pb-1 align-middle mr-0.5 ml-2" />{channelData.name}! 🚀
          </span>
        </p>
      ) : (
        <></>
        // <p className="text-lg text-center mb-8 font-light">
        //   Your contribution of ${totalAmountInDollars.toFixed(0)} has been added towards
        //   <span className="inline whitespace-nowrap">
        //     <FaRobot className="inline h-5 w-5 pb-1 align-middle mr-1" />{channelData.name}'s
        //   </span> activation!
        // </p>
      )}
      {newChatCreditsAdded > 0 && (
        <p className="text-2xl text-center mb-8 font-bold">      
          You sponsored {newChatCreditsAdded.toLocaleString()} chats!
        </p>
      )}
      <div className="flex items-center justify-center mb-12">
        <Avatar className="w-32 h-32 rounded-full mr-4">
          <AvatarImage src={channelData.imageUrl} alt={`${channelData.name}'s avatar`} />
          <AvatarFallback>{channelData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-3xl font-extrabold mb-1">{channelData.title}</h3>
          <h4 className="text-2xl font-bold mb-2">
            <span className="inline whitespace-nowrap">
              <FaRobot className="inline h-5 w-5 pb-1 mr-1 align-middle" />{channelData.name}
            </span>
          </h4>
          {badges.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {/* {userImageUrl && (
                  <div className="flex">
                    <img src={userImageUrl} alt="User Avatar" className="w-6 h-6 rounded-full" />
                  </div>
                )} */}
                {badges.map((badge) => (
                  <BadgeComponent key={badge} type={badge} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {channelData.status === 'ACTIVE' && (
        <p className="text-lg text-center mb-8 font-light mx-10">
          Invite your friends to chat with an AI trained on {channelData.title} transcripts!
        </p>
      )}
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="sm:w-10/12 md:w-8/12 lg:w-6/12 pb-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-6 text-white">
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>
              {renderModalContent()}
              <div className="flex flex-col gap-4 items-center">
                <Button
                  onClick={() => handleShare('twitter')}
                  className="max-w-xs w-full bg-black hover:bg-gray-700 text-white font-semibold py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <span
                    className="mr-2 text-white text-xl font-semibold"
                    style={{
                      fontSize: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '20px',
                      width: '20px',
                    }}
                  >
                    𝕏
                  </span>
                  Share on 𝕏
                </Button>
                <Button
                  onClick={() => handleShare('facebook')}
                  className="max-w-xs w-full bg-[#4267B2] hover:bg-[#365899] text-white font-semibold py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Share on Facebook
                </Button>
                <Button
                  onClick={() => handleShare('linkedin')}
                  className="max-w-xs w-full bg-[#0077B5] hover:bg-[#006699] text-white font-semibold py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <Linkedin className="mr-2 h-5 w-5" />
                  Share on LinkedIn
                </Button>
                <Button
                  onClick={copyToClipboard}
                  className="max-w-xs w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <Link className="mr-2 w-5 h-5" />
                  Copy Share Message
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};