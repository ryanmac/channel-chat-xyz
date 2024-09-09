// components/Header.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from 'lucide-react'
import YouTubeChannelSearch from '@/components/YouTubeChannelSearchMock'
import { signIn, signOut, useSession } from 'next-auth/react'
import { UserMenu } from './UserMenu'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  
  // State to track when the component has mounted
  const [mounted, setMounted] = useState(false)

  // Ensure the component only renders dynamic content on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="/logomark2.png" alt="ChannelChat" />
            <AvatarFallback>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">C</span>
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="text-xl font-bold">ChannelChat</span>
        </Link>
        <div className="flex items-center space-x-4">
          <YouTubeChannelSearch className="hidden sm:block" />
          {mounted && ( // Only render after client-side hydration
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
          {status === "authenticated" ? (
            <UserMenu user={session.user} />
          ) : (
            <button
              onClick={() => signIn("google")}
              className="text-gray-500 dark:text-white border-gray-500 hover:scale-110 font-bold py-2 px-4 rounded w-full"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}