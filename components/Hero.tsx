// components/Hero.tsx
'use client'

import { useState, useEffect } from 'react'
import ChannelSearch from '@/components/ChannelSearch';
import Image from 'next/image'
import { FeaturedChatInterface } from './FeaturedChatInterface';

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // JavaScript for generating dynamic keyframes
  const createWaveAnimation = (index: number) => {
    const distance = 20 * index; // Moving the waves up by 20% for each wave
    const controlPoint1X = 360; // Reduced x-distance for the first control point
    const controlPoint2X = 360; // Reduced x-distance for the second control point

    return `
      @keyframes wave${index} {
        0%, 100% {
          opacity: 1; 
          d: path('M 0 ${200 - distance} C ${controlPoint1X} ${100 + distance}, ${controlPoint2X} ${300 - distance}, 1440 ${200 - distance}');
        }
        50% {
          opacity: 1; 
          d: path('M 0 ${200 - distance} C ${controlPoint1X} ${300 - distance}, ${controlPoint2X} ${100 + distance}, 1440 ${200 - distance}');
        }
      }
    `;
  };

  return (
    <section className="relative overflow-hidden py-8 md:py-18 lg:py-24 xl:py-32 animate-spin-slow">
      {/* Animated sin waves */}
      {mounted && (
        <div className="absolute inset-0 z-0">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 400">
            <defs>
              <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
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
                d={`M 0 ${180 - i * 10} C 180 ${100 + i * 50}, 360 ${300 - i * 50}, 1440 ${200 - i * 20}`}
              />
            ))}
          </svg>
        </div>
      )}

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-12">
          {/* Left side content */}
          <div className="flex w-full flex-col items-center space-y-8 text-center lg:w-1/2 lg:items-start lg:text-left">
            <div className="space-y-4 px-4 pb-0">
              <div className="inline-flex items-center rounded-full px-3 py-1">
                <Image
                  src="/logomark-play2.png"
                  alt="ChannelChat Logo"
                  width={200}
                  height={200}
                  className="mr-2 h-[200px] w-auto"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tighter text-indigo-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                AI-powered conversations beyond the play button
              </h1>
              <p className="max-w-[600px] text-lg text-indigo-900 dark:text-gray-300 md:text-xl">
                Engage with your favorite content creators through intelligent conversations powered by AI.
              </p>
            </div>
            <div className="w-full max-w-md">
              <ChannelSearch
                containerClassName="sm:w-[24rem] lg:ml-0"
                inputClassName="h-16 text-lg"
                buttonClassName="w-16 h-16"
              />
            </div>
          </div>

          {/* Right side content */}
          <div className="relative w-full lg:w-1/2">
            <FeaturedChatInterface />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sin-wave {
          animation: wave 20s ease-in-out infinite;
          opacity: 1;
        }

        ${[1, 2, 3, 4].map((i) => createWaveAnimation(i)).join(' ')}

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
      `}</style>
    </section>
  );
}