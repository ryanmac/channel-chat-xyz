'use client'

import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="bg-background py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              ChannelChat
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Empower YouTube creators and their communities with AI-powered chatbots
            </p>
          </div>
          <div className="space-x-4">
            {/* <Button>Start Exploring Channels</Button> */}
            {/* <Button variant="outline">See How It Works</Button> */}
          </div>
        </div>
      </div>
    </section>
  )
}