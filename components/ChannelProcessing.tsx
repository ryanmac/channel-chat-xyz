'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export const ChannelProcessing: React.FC<{ channelData: { name: string } }> = ({ channelData }) => {
  const [progress, setProgress] = useState(0)
  const totalDuration = 90 // total duration in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval) // Stop the interval when complete
          return 100
        }
        return Math.min(prevProgress + (100 / totalDuration), 100) // Increment progress
      })
    }, 1000)

    const timeout = setTimeout(() => {
      window.location.reload() // Refresh the page after 90 seconds
    }, totalDuration * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
      <div className="absolute inset-0 bg-white opacity-10 animate-pulse/5"></div>
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 border-4 border-white rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-white border-t-transparent rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute inset-4 border-4 border-white border-t-transparent rounded-full animate-spin animation-delay-300"></div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-4">
            Activating {channelData.name}
          </h2>
          <p className="text-lg text-center mb-6">
            We're processing your channel activation, extracting transcripts, and training the AI on the tone, style, and content of this channel.
          </p>
          <p className="text-lg text-center mb-6">
            This may take a few minutes.
          </p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center text-white text-opacity-80">
            We'll update you once the process is complete, or you can come back in a couple minutes. It's safe to refresh.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}