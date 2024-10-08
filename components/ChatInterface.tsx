// components/ChatInterface.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, ArrowDown, Maximize2 } from 'lucide-react';
import { default as ClientMarkdown } from '@/components/ClientMarkdown';
import QuickPrompts from '@/components/QuickPrompts';
import TypingIndicator from '@/components/TypingIndicator';
import { useToast } from "@/hooks/use-toast";
import { ChannelData } from '@/utils/channelManagement';
import { FaRobot } from "react-icons/fa6";
import { getChannelInterests } from '@/utils/debateUtils';
import Link from 'next/link';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  channelData: ChannelData;
  showMaximize?: boolean;
}

const MAX_TOKENS = 50000;
const WARNING_TOKENS = 40000;

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ channelData, showMaximize }) => {
  showMaximize = showMaximize || false;
  
  // Randomize interests and select the first three
  const randomizedInterests = channelData.interests.sort(() => Math.random() - 0.5).slice(0, 3);

  // Format the interests into the desired string format
  const formattedInterests = randomizedInterests
    .map(interest => `**${interest.title}**: ${interest.description}`)
    .join('\n\n');

  // Initialize the messages state with the formatted interests included
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'AI',
      content: `My memory is loaded with **${channelData.totalVideos}** video transcripts so far.\n\n${formattedInterests}\n\nWhat would you like to discuss?`,
      timestamp: '12:00 PM',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);

  const { toast } = useToast();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    }
  }, []);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton, scrollToBottom]);

  // Auto-expand textarea
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'; // Reset height to allow shrinking
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`; // Limit to 5 lines (120px)
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    adjustTextareaHeight();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      if (tokenCount >= MAX_TOKENS) {
        toast({
          title: "Token limit reached",
          description: "You've reached the maximum token limit for this chat. Please start a new chat.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      const userMessage: Message = { id: messages.length + 1, sender: 'You', content: input, timestamp: new Date().toLocaleTimeString() };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channelData, query: input, chatSessionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.errorCode === 'NO_CREDITS') {
            toast({
              title: "Out of Credits",
              description: "This channel has run out of credits. Please purchase more to continue chatting.",
              variant: "destructive",
            });
            return;
          }
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        const aiMessage: Message = { id: messages.length + 2, sender: 'AI', content: data.response, timestamp: new Date().toLocaleTimeString() };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        setChatSessionId(data.chatSessionId);
        setTokenCount(data.tokenCount);

        if (data.tokenCount >= WARNING_TOKENS) {
          toast({
            title: "Token Warning",
            description: `Warning: You've used ${data.tokenCount} tokens. Approaching limit.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error in chat:', error);
        const errorMessage: Message = { id: messages.length + 2, sender: 'AI', content: 'An error occurred. Please try again.', timestamp: new Date().toLocaleTimeString() };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full bg-gray-400/50 dark:bg-gray-900/50 border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex">
            Chat with
            <FaRobot className="w-6 h-6 pb-1 text-gray-800 dark:text-white ml-2 mr-0.5" />
            {channelData.name}
          </span>
          {tokenCount >= WARNING_TOKENS && (
            <span className="text-sm font-normal">Tokens used: {tokenCount}/{MAX_TOKENS}</span>
          )}
          {showMaximize && (
            <div>
              <Link href={`/channel/${channelData.name}`}>
                <Maximize2 className="w-6 h-6 text-gray-800 dark:text-white" />
              </Link>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div
          ref={chatContainerRef}
          className="chat-container min-h-[300px] max-h-[600px] overflow-y-auto pr-2 sm:pr-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`mb-2 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'} sm:mb-4`} /* Adjust margin-bottom on small screens */
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              {message.sender === 'AI' && (
                <div className="relative hidden mr-2 sm:block">
                  <Avatar className="w-8 h-8 rounded-full">
                    <AvatarImage src={channelData.imageUrl} alt={channelData.title} />
                    <AvatarFallback>{channelData.title[0]}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div
                className={`inline-block p-2 sm:p-4 rounded-lg max-w-[100%] sm:max-w-[90%] ${message.sender === 'You' ? 'bg-blue-500 text-white dark:bg-blue-800 dark:text-white' : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'}`} /* Increased max-width on smaller screens */
              >
                <p className="font-semibold flex items-center dark:prose-invert">
                  {message.sender === 'AI' ? (
                    <>
                      {channelData.title}
                      <FaRobot className="w-5 h-5 text-gray-500 dark:text-white ml-1" />
                    </>
                  ) : (
                    'You'
                  )}
                </p>
                <div className="break-words prose prose-sm dark:prose-invert custom-prose">
                  <ClientMarkdown content={message.content} />
                </div>
              </div>
              {message.sender === 'You' && <div className="w-8 h-8 ml-0 sm:ml-2" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="relative mr-2">
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarImage src={channelData.imageUrl} alt={channelData.title} />
                  <AvatarFallback>{channelData.title[0]}</AvatarFallback>
                </Avatar>
              </div>
              <TypingIndicator />
            </div>
          )}
        </div>
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 border-gray-400 backdrop-blur-sm absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <QuickPrompts
          onPromptSelect={handleQuickPrompt}
        />
        <div className="flex w-full space-x-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            rows={1}
            className="resize-none w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            style={{ maxHeight: '120px' }} // 5 lines
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};