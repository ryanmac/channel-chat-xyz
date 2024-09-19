// components/DebateInterface.tsx
import React, { useEffect, useRef } from 'react';
import { Debate, DebateTurn } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { default as ClientMarkdown } from '@/components/ClientMarkdown';
import { getTopic } from '@/utils/debateUtils';
import TypingIndicator from '@/components/TypingIndicator';
import { Merge } from 'lucide-react';

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
            isChannel1 ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'
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
      </CardContent>
    </Card>
  );
};