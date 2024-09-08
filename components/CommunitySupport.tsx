'use client'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function CommunitySupport() {
  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Support Our Community</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-center text-gray-600 dark:text-gray-300">
            Help keep our AI-powered chatbots running by sponsoring channels. Your support makes a difference!
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Channel Funding Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">TechTalks</span>
                  <span className="text-sm font-medium">70%</span>
                </div>
                <Progress value={70} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">GamingGurus</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <Progress value={45} className="w-full" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="mb-4 text-sm text-gray-500">Recent Activity: User123 sponsored @TechTalks</p>
            <Button size="lg">Sponsor a Channel</Button>
          </div>
        </div>
      </div>
    </section>
  )
}