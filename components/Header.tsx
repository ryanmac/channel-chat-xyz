'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import dynamic from 'next/dynamic'
import { Moon, Sun } from 'lucide-react'
import YouTubeChannelSearch from '@/components/YouTubeChannelSearchMock'

const MoonIcon = dynamic(() => import('lucide-react').then((mod) => mod.Moon), { ssr: false })
const SunIcon = dynamic(() => import('lucide-react').then((mod) => mod.Sun), { ssr: false })

interface HeaderProps {
  isLoggedIn: boolean
  userAvatar?: string
  username?: string
}

export function Header({ isLoggedIn, userAvatar, username }: HeaderProps) {
  const { theme, setTheme } = useTheme()

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
          <YouTubeChannelSearch />
          {/* {typeof window !== 'undefined' && ( */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
          {/* )} */}
          {isLoggedIn ? (
            <Avatar>
              <AvatarImage src={userAvatar} alt={username} />
              <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          ) : (
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}