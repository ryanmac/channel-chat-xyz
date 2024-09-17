import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Youtube } from 'lucide-react';
import { ChannelData } from '@/utils/channelManagement';
import { abbreviateNumber } from '@/utils/numberUtils';
import { FaRobot } from "react-icons/fa6";

interface ChannelHeaderProps {
  channelData: ChannelData;
}

export function ChannelHeader({
  channelData,
}: ChannelHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Extract data from channelData
  const {
    name: channelName,
    title: channelTitle,
    metadata: {
      snippet: { localized: { description }, thumbnails, customUrl },
      statistics: { subscriberCount, viewCount, videoCount },
      brandingSettings: { image: { bannerExternalUrl } }
    }
  } = channelData;

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

  return (
    <div className="w-full">
      <div className="w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(${bannerExternalUrl})` }} />
      <div className="container mx-auto px-4 -mt-6">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="w-32 h-32 border-4 border-white align-top rounded-full">
            <AvatarImage src={thumbnails.default.url} alt={sanitizedChannelName} />
            <AvatarFallback>{sanitizedChannelName[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-grow w-full">
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-4 md:mt-0">
              <h1 className="text-3xl font-bold flex items-center">
                {channelTitle}
                <FaRobot className="w-8 h-8 text-gray-500 dark:text-white ml-1" />
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
              {abbreviateNumber(parseInt(subscriberCount))} subscribers • {abbreviateNumber(parseInt(viewCount))} views • {parseInt(videoCount).toLocaleString()} videos
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
  );
}