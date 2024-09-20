// components/DebateInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Debate, DebateTurn } from '@prisma/client';
import { Share2, Facebook, Linkedin, Link } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { default as ClientMarkdown } from '@/components/ClientMarkdown';
import { getTopic } from '@/utils/debateUtils';
import TypingIndicator from '@/components/TypingIndicator';
import { Merge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const MAX_TURNS = 10;

interface ExtendedDebate extends Debate {
  turns: DebateTurn[];
}

interface DebateInterfaceProps {
  debate: ExtendedDebate;
  isLoading: boolean;
  onTurn: (debateId: string, content: string) => Promise<void>;
  onConclude: (debateId: string) => Promise<void>;
  channel1: { name: string; imageUrl: string | null };
  channel2: { name: string; imageUrl: string | null };
}

export const DebateInterface: React.FC<DebateInterfaceProps> = ({
  debate,
  isLoading,
  onTurn,
  onConclude,
  channel1,
  channel2
}) => {
  const lastTurnRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false); // Ref to track if a turn is being processed

  // Extract the topic parts
  const { topicTitle, topicDescription } = getTopic(debate.topic || '');

  // Scroll to the latest turn when a new turn is added
  useEffect(() => {
    if (lastTurnRef.current) {
      lastTurnRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debate?.turns]);

  // Manage turn processing and conclusion of the debate
  useEffect(() => {
    if (!debate || !Array.isArray(debate.turns)) return;

    // Check if the debate is concluded and call conclude if true
    if (debate.status === 'CONCLUDED') {
      onConclude(debate.id);
      return;
    }

    // Trigger the next turn only if not already processing a turn
    if (!isLoading && !isProcessingRef.current && debate.turns.length < MAX_TURNS) {
      isProcessingRef.current = true; // Mark as processing
      onTurn(debate.id, '').finally(() => {
        isProcessingRef.current = false; // Reset processing state once turn is complete
      });
    }
  }, [debate, onTurn, onConclude, isLoading]);

  // Render each turn of the debate with appropriate formatting and avatars
  const renderTurn = (turn: DebateTurn, index: number) => {
    const isChannel1 = turn.channelId === debate.channelId1;
    const channel = isChannel1 ? channel1 : channel2;
    return (
      <div
        key={turn.id}
        className={`flex ${isChannel1 ? 'justify-start' : 'justify-end'}`}
        ref={index === debate.turns.length - 1 ? lastTurnRef : null}
      >
        {isChannel1 && (
          <Avatar className="w-8 h-8 mr-2 rounded-full">
            <AvatarImage src={channel.imageUrl || undefined} alt={channel.name} />
            <AvatarFallback>{channel.name[0]}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`inline-block p-4 rounded-lg max-w-[80%] ${
            isChannel1 ? 'bg-blue-100/70 text-blue-950' : 'bg-green-100/70 text-green-950'
          }`}
        >
          <p className="font-semibold">{channel.name}</p>
          <div className="mt-1 custom-prose">
            <ClientMarkdown content={turn.content} />
          </div>
        </div>
        {!isChannel1 && (
          <Avatar className="w-8 h-8 ml-2 rounded-full">
            <AvatarImage src={channel.imageUrl || undefined} alt={channel.name} />
            <AvatarFallback>{channel.name[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  };

  // Sharing
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const currentUrl = `/collab/${debate.id}`; // Dynamic URL for the current debate
  const shareMessage = `Check out this AI-powered collab between @${channel1.name} and @${channel2.name} on the topic "${topicTitle}". Dive into the conversation and see how AI can power debates!`;

  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareMessage)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(
      'AI-Powered Debate Collaboration'
    )}&summary=${encodeURIComponent(shareMessage)}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    if (isClient) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  const copyToClipboard = () => {
    if (isClient) {
      navigator.clipboard
        .writeText(`${shareMessage} ${currentUrl}`)
        .then(() => {
          toast({
            title: 'Copied to clipboard',
            description: 'The share message has been copied to your clipboard.',
          });
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          toast({
            title: 'Failed to copy',
            description: 'There was an error copying the message. Please try again.',
            variant: 'destructive',
          });
        });
    }
  };

  return (
    <Card className="w-full mt-8 bg-slate-800/60 border-none">
      <CardHeader>
        <CardTitle>
          <p className="text-2xl font-bold">{topicTitle}</p>
          {topicDescription && <p className="text-xl font-normal">{topicDescription}</p>}
          <div className="flex items-center gap-4 mt-4">
            <Avatar className="w-10 h-10 rounded-full">
              <AvatarImage src={channel1.imageUrl || undefined} alt={channel1.name} />
              <AvatarFallback>{channel1.name[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{channel1.name}</span>
            <span className="text-muted-foreground"><Merge className="w-8 h-8 text-primary animate-pulse transform rotate-180" /></span>
            <span className="font-semibold">{channel2.name}</span>
            <Avatar className="w-10 h-10 rounded-full">
              <AvatarImage src={channel2.imageUrl || undefined} alt={channel2.name} />
              <AvatarFallback>{channel2.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {debate.turns?.map(renderTurn)}
          {/* Show typing indicator while loading */}
          {isLoading && (
            <div className={`flex ${debate.turns?.length % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              {debate.turns?.length % 2 === 0 && (
                <Avatar className="w-8 h-8 mr-2 rounded-full">
                  <AvatarImage src={channel1.imageUrl || undefined} alt={channel1.name} />
                  <AvatarFallback>{channel1.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <TypingIndicator />
              {debate.turns?.length % 2 !== 0 && (
                <Avatar className="w-8 h-8 ml-2 rounded-full">
                  <AvatarImage src={channel2.imageUrl || undefined} alt={channel2.name} />
                  <AvatarFallback>{channel2.name[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>
        {(debate.status === 'CONCLUDED' || debate.turns?.length >= MAX_TURNS) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center mt-12 mb-4"
          >
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <ShareButton
                  onClick={() => handleShare('x')}
                  icon={<span
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
                  </span>}
                  label="Share on X"
                  className="bg-black hover:bg-gray-800"
                />
                <ShareButton
                  onClick={() => handleShare('facebook')}
                  icon={<Facebook className="w-5 h-5" />}
                  label="Share on Facebook"
                  className="bg-[#1877F2] hover:bg-[#166fe5]"
                />
                <ShareButton
                  onClick={() => handleShare('linkedin')}
                  icon={<Linkedin className="w-5 h-5" />}
                  label="Share on LinkedIn"
                  className="bg-[#0A66C2] hover:bg-[#094c8f]"
                />
                <ShareButton
                  onClick={copyToClipboard}
                  icon={<Link className="w-5 h-5" />}
                  label="Copy Link"
                  className="bg-gray-500 hover:bg-gray-600"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

interface ShareButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

function ShareButton({ onClick, icon, label, className }: ShareButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`text-white font-bold py-3 px-6 rounded-full flex items-center space-x-2 transition-all duration-300 ease-in-out transform hover:scale-105 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}