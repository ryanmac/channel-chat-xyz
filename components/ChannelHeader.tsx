// components/ChannelHeader.tsx
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Youtube } from 'lucide-react'
import { TokenUsageInfo } from './TokenUsageInfo'

interface ChannelHeaderProps {
  channelName: string; // Unique identifier
  channelTitle: string; // Human-readable title
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  description: string;
  bannerUrl: string;
  profilePictureUrl: string;
  botTier: string;
  isActive: boolean;
  chatsCreated: number;
}

export function ChannelHeader({
  channelName,
  channelTitle,
  subscriberCount,
  totalViews,
  videoCount,
  description,
  bannerUrl,
  profilePictureUrl,
  botTier,
  isActive,
  chatsCreated
}: ChannelHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const sanitizedChannelName = channelName.replace(/^@/, '');

  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim();
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const collapsedDescriptionLength = 60;
  const truncatedDescription = truncateDescription(description, collapsedDescriptionLength);
  const showMoreLink = description.length > collapsedDescriptionLength;

  const abbreviateNumber = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  return (
    <div className="w-full">
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${bannerUrl})` }} />
      <div className="container mx-auto px-4 -mt-6">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-32 h-32 border-4 border-white align-top">
            <AvatarImage src={profilePictureUrl} alt={sanitizedChannelName} />
            <AvatarFallback>{sanitizedChannelName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-grow w-full">
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-4 md:mt-0">
              <h1 className="text-3xl font-bold flex items-center">
                {channelTitle}
                <Bot className="w-8 h-8 text-gray-500 dark:text-white ml-1" />
              </h1>
              <Link
                href={`https://www.youtube.com/channel/@${sanitizedChannelName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700"
                aria-label={`Visit ${channelTitle} on YouTube`}
              >
                <Youtube className="w-8 h-8" />
              </Link>
            </div>
            <p className="mt-2">
              <Link
                href={`https://www.youtube.com/channel/@${sanitizedChannelName}`}
                target="_blank"
                rel="noopener noreferrer"
                className=""
                aria-label={`Visit ${channelName} on YouTube`}
              >
                @{channelName}
              </Link>
              {' • '}
              {abbreviateNumber(subscriberCount)} subscribers • {abbreviateNumber(totalViews)} views • {videoCount.toLocaleString()} videos
            </p>
            <div className="mt-2 text-center md:text-left">
              <p className="inline">
                {isDescriptionExpanded ? description : truncatedDescription}
                {showMoreLink && (
                  <button
                    onClick={toggleDescription}
                    className="ml-0 font-bold text-gray-500 dark:text-white hover:underline focus:outline-none"
                    aria-expanded={isDescriptionExpanded}
                  >
                    {isDescriptionExpanded ? 'Show less' : '...more'}
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}