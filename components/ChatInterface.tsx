// app/components/ChatInterface.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, ArrowDown } from 'lucide-react'
import { default as ClientMarkdown } from '@/components/ClientMarkdown'
import QuickPrompts from '@/components/QuickPrompts'
import TypingIndicator from '@/components/TypingIndicator'

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  channelName: string
  channelId: string
  profilePictureUrl: string
  botTier: string
  boosts: string[]
  isActive: boolean
  uniqueVideoCount: number
}

const ScrollToBottomButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => (
  <Button
    variant="outline"
    size="icon"
    className={`rounded-full bg-background/80 border-gray-400 backdrop-blur-sm ${className}`}
    onClick={onClick}
  >
    <ArrowDown className="h-4 w-4" />
  </Button>
)

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  channelName,
  channelId,
  profilePictureUrl,
  botTier,
  boosts,
  isActive,
  uniqueVideoCount
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'AI',
      content: `Welcome to the ${channelName} chatbot!\n\nMy memory is loaded with **${uniqueVideoCount}** video transcripts.\n\nHow can I assist you today?`,
      timestamp: '12:00 PM'
    }
  ]);
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100
      setShowScrollButton(isScrolledUp)
    }
  }, [])

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll)
      return () => chatContainer.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom()
    }
  }, [messages, showScrollButton, scrollToBottom])

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true)
      const userMessage: Message = { id: messages.length + 1, sender: 'You', content: input, timestamp: new Date().toLocaleTimeString() }
      setMessages(prevMessages => [...prevMessages, userMessage])
      setInput('')

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channelId, query: input }),
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        const aiMessage: Message = { id: messages.length + 2, sender: 'AI', content: data.response, timestamp: new Date().toLocaleTimeString() }
        setMessages(prevMessages => [...prevMessages, aiMessage])
      } catch (error) {
        console.error('Error in chat:', error)
        const errorMessage: Message = { id: messages.length + 2, sender: 'AI', content: 'An error occurred. Please try again.', timestamp: new Date().toLocaleTimeString() }
        setMessages(prevMessages => [...prevMessages, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          Chat with {channelName}
          <Bot className="w-6 h-6 text-gray-500 dark:text-white ml-1" />
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div 
          ref={chatContainerRef}
          className="h-[calc(100vh-400px)] min-h-[300px] max-h-[600px] overflow-y-auto pr-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              {message.sender === 'AI' && (
                <div className="relative mr-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profilePictureUrl} alt={channelName} />
                    <AvatarFallback>{channelName[0]}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className={`inline-block p-2 rounded-lg max-w-[80%] ${message.sender === 'You' ? 'bg-blue-500 text-white dark:bg-blue-800 dark:text-white' : 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white'}`}>
                <p className="font-semibold flex items-center">
                  {message.sender === 'AI' ? (
                    <>
                      {channelName}
                      <Bot className="w-4 h-4 text-gray-500 dark:text-white ml-1" />
                    </>
                  ) : (
                    'You'
                  )}
                </p>
                <div className="break-words prose prose-sm dark:prose-invert">
                  <ClientMarkdown content={message.content} />
                </div>
                {/* <p className="text-xs mt-1 opacity-70">{message.timestamp}</p> */}
              </div>
              {message.sender === 'You' && <div className="w-8 h-8 ml-2" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="relative mr-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profilePictureUrl} alt={channelName} />
                  <AvatarFallback>{channelName[0]}</AvatarFallback>
                </Avatar>
              </div>
              <TypingIndicator />
            </div>
          )}
        </div>
        {showScrollButton && (
          <ScrollToBottomButton
            onClick={scrollToBottom}
            className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-10"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <QuickPrompts onPromptSelect={handleQuickPrompt} />
        <div className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}