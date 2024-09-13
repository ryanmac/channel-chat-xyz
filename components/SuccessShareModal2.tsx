// components/SuccessShareModal2.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { X, Facebook, Linkedin, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BadgeComponent } from '@/components/BadgeComponent';
import { BadgeType } from '@/utils/badgeManagement';
import Confetti from 'react-confetti';
import { useToast } from '@/hooks/use-toast';

interface SuccessShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  channelTitle: string;
  badges: BadgeType[];
  sponsorshipAmount: number;
  totalFunding: number;
  newChatCreditsAdded: number;
  wasActivated: boolean;
}

export const SuccessShareModal: React.FC<SuccessShareModalProps> = ({
  isOpen,
  onClose,
  channelName,
  channelTitle,
  badges,
  sponsorshipAmount,
  totalFunding,
  newChatCreditsAdded,
  wasActivated,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
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
  }, []);

  if (!isOpen) return null;

  // Function to determine the share message
  const determineShareMessage = () => {
    if (badges.includes('activator')) {
      return `I just activated the AI chatbot for @${channelName} on @ChannelChat!\n\nTrained on transcripts from YouTube videos, this chatbot can now generate responses to your messages in the style of the channel's host. Try it out!\n\n#ChannelChat #AI #Chatbot #YouTube\n\n`;
    } else if (badges.includes('founding') && !badges.includes('activator')) {
      const remainingToActivate = (10 - totalFunding).toFixed(2);
      return `I'm supporting the AI chatbot for @${channelName} on @ChannelChat!\n\nIt's ${(totalFunding / 10) * 100}% funded, and only $${remainingToActivate} more to go for activation! Help us cross the finish line and enjoy chatting in the style of your favorite channel.\n\n#ChannelChat #AI #Crowdfunding\n\n`;
    } else {
      const chatCredits = newChatCreditsAdded ? newChatCreditsAdded.toLocaleString() : '0';
      return `I just added ${chatCredits} chats to the AI chatbot for @${channelName} on @ChannelChat!\n\nJoin in and start chatting in the style of your favorite YouTube channel's host.\n\n#ChannelChat #AI #Chatbot #YouTube\n\n`;
    }
  };

  const shareMessage = determineShareMessage();

  const currentUrl = `https://channelchat.xyz/channel/@${channelName}`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent('I Activated an AI Chatbot!')}&summary=${encodeURIComponent(shareMessage)}`,
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

  // Function to render the modal content based on conditions
  const renderModalContent = () => {
    return (
      <>
        <h2 className="text-4xl font-extrabold text-center mb-6 mt-4">
          {badges.includes('activator') ? 'Congratulations! 🎉' : 'Thank you! 🙏'}
        </h2>
        <div className="text-xl text-center mb-6 font-light flex items-center justify-center">
          <span className="inline-flex items-center mx-1">
            <Avatar className="inline-flex items-center">
              <AvatarImage src="/logomark-play.png" alt="ChannelChat" />
              <AvatarFallback>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">C</span>
                </div>
              </AvatarFallback>
            </Avatar>
          </span>
          <strong className="mr-2">ChannelChat</strong>{badges.includes('activator') ? ' activated for' : ''}
        </div>
        <h3 className="text-2xl font-bold text-center mb-2">{channelTitle}</h3>
        <h4 className="text-xl font-bold text-center mb-4">@{channelName}</h4>
        <div className="flex flex-wrap justify-center gap-2 mt-12 mb-8">
          {badges.map((badge) => (
            <BadgeComponent key={badge} type={badge} />
          ))}
        </div>
        <p className="text-lg text-center mb-8 font-light">
          Invite your friends to try it out.
        </p>
      </>
    );
  };

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