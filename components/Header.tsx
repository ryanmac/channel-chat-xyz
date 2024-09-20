// components/Header.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from 'lucide-react'
import ChannelSearch from '@/components/ChannelSearch'
import { signIn, signOut, useSession } from 'next-auth/react'
import { UserMenu } from '@/components/UserMenu'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <header>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Avatar className="border-none">
            <AvatarImage src="/logomark-play2.png" alt="ChannelChat" />
            <AvatarFallback>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">C</span>
              </div>
            </AvatarFallback>
          </Avatar>
          <span className="text-3xl font-black tracking-tight text-indigo-900 dark:text-indigo-50">ChannelChat</span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block sm:w-full">
            <ChannelSearch
              containerClassName="w-full sm:w-[20rem]"
              inputClassName="h-10"
              buttonClassName="w-10"
            />
          </div>
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
            <UserMenu user={session.user} session={session} />
          ) : (
            <Button
              onClick={() => signIn("google")}
              className="text-gray-500 dark:text-gray-200 border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:scale-110 font-bold py-2 px-4 rounded w-full"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}