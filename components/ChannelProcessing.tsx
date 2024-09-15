'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export const ChannelProcessing: React.FC<{ channelData: { name: string } }> = ({ channelData }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto mt-8 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
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
            We're processing your channel activation. This may take a few minutes.
          </p>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center text-white text-opacity-80">
            Please don't close this page. We'll update you once the process is complete.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}