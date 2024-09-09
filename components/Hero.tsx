'use client'

import { useState, useEffect } from 'react'
import YouTubeChannelSearch from '@/components/YouTubeChannelSearchMock'
import Image from 'next/image'

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-teal-800 to-purple-900 dark:from-purple-950 dark:via-teal-900 dark:to-purple-950 py-8 md:py-18 lg:py-24 xl:py-32">
      {/* Animated sin waves */}
      {mounted && (
        <div className="absolute inset-0 z-0">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 400">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {[1, 2, 3, 4].map((i) => (
              <path
                key={i}
                className={`sin-wave sin-wave-${i}`}
                fill="none"
                stroke="url(#wave-gradient)"
                strokeWidth={i * 0.5}
                filter="url(#glow)"
                d="M 0 200 C 360 100, 720 300, 1440 200"
              />
            ))}
          </svg>
        </div>
      )}

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Image
                src="/logomark-play2.png"
                alt="ChannelChat Logo"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl/none">
                ChannelChat
              </h1>
            </div>
            <p className="mx-auto max-w-[700px] py-8 text-gray-200 md:text-xl">
              Chat with AI-powered YouTube Channels
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <YouTubeChannelSearch />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sin-wave {
          animation: wave 20s ease-in-out infinite;
          opacity: 0;
        }

        .sin-wave-1 {
          animation-name: wave1;
        }

        .sin-wave-2 {
          animation-name: wave2;
        }

        .sin-wave-3 {
          animation-name: wave3;
        }

        .sin-wave-4 {
          animation-name: wave4;
        }

        @keyframes wave1 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 150, 720 250, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 250, 720 150, 1440 200'); }
        }

        @keyframes wave2 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 100, 720 300, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 300, 720 100, 1440 200'); }
        }

        @keyframes wave3 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 50, 720 350, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 350, 720 50, 1440 200'); }
        }

        @keyframes wave4 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 0, 720 400, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 400, 720 0, 1440 200'); }
        }

        @keyframes wave5 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 150, 720 250, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 250, 720 150, 1440 200'); }
        }

        @keyframes wave6 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 100, 720 300, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 300, 720 100, 1440 200'); }
        }

        @keyframes wave7 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 50, 720 350, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 350, 720 50, 1440 200'); }
        }

        @keyframes wave8 {
          0%, 100% { opacity: 0.1; d: path('M 0 200 C 360 0, 720 400, 1440 200'); }
          50% { opacity: 0.2; d: path('M 0 200 C 360 400, 720 0, 1440 200'); }
        }

        @keyframes wave9 {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }

      `}</style>
    </section>
  )
}