// components/ShareChannelActivation.tsx
import React, { useState, useEffect } from 'react'
import { Share2, Facebook, Linkedin, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "@/hooks/use-toast"

interface ShareChannelActivationProps {
  channelName: string
  channelId: string
  initialFunding: number
  goalFunding: number
}

export function ShareChannelActivation({ channelName, channelId, initialFunding, goalFunding }: ShareChannelActivationProps) {
  const [isClient, setIsClient] = useState(false)
  const [currentFunding, setCurrentFunding] = useState(initialFunding)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const currentUrl = `https://channelchat.xyz/channel/@${channelName}`

  useEffect(() => {
    setIsClient(true)
    fetchLatestFunding()
  }, [])

  const fetchLatestFunding = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/channel/funding?channelId=${channelId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch latest funding')
      }
      const data = await response.json()
      setCurrentFunding(data.currentFunding)
    } catch (error) {
      console.error('Error fetching latest funding:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch latest funding information.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const remainingToActivate = Math.max(0, goalFunding - currentFunding)
  const percentageComplete = (currentFunding / goalFunding) * 100

  const shareMessage = `Help unlock AI-powered conversations with @${channelName} on @ChannelChatXYZ! 🚀\n\nWe're only $${remainingToActivate.toFixed(0)} away from activating and training the chatbot on YouTube transcripts.\n\nLet's make it happen together!`

  const shareUrls = {
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareMessage)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent('Help Activate AI Chatbot')}&summary=${encodeURIComponent(shareMessage)}`,
  }

  const handleShare = (platform: keyof typeof shareUrls) => {
    if (isClient) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer')
    }
  }

  const copyToClipboard = () => {
    if (isClient) {
      navigator.clipboard.writeText(`${shareMessage} ${currentUrl}`).then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The share message has been copied to your clipboard.",
        })
      }).catch((err) => {
        console.error('Failed to copy: ', err)
        toast({
          title: "Failed to copy",
          description: "There was an error copying the message. Please try again.",
          variant: "destructive",
        })
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 shadow-2xl"
    >
      <div className="p-8 text-white">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Can't contribute? Spread the word!
        </h2>
        <p className="text-xl mb-4 text-center font-light">
          Your network could be the key to unlocking <strong>@{channelName}</strong>'s AI chatbot!
        </p>
        <p className="text-lg mb-8 text-center font-light">
          We're so close - just <span className="font-semibold text-yellow-300">${remainingToActivate.toFixed(0)}</span> away from bringing this amazing AI experience to life.
        </p>
        <AnimatePresence>
          {isClient && !isLoading && (
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
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-center text-sm text-white/80"
        >
          <p className="font-semibold">Every share brings us closer to activation!</p>
          <p>Be the catalyst for AI-powered conversations.</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface ShareButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  className?: string
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
  )
}