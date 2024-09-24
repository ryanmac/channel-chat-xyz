// components/CollabList.tsx
'use client'

import { useState, useEffect } from 'react'
import { Channel } from '@prisma/client'
import { Loader2, Merge } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaRobot } from 'react-icons/fa6'

type CollabListItem = {
  id: string
  channel1: Channel
  channel2: Channel
  topicTitle: string
  topicDescription: string
}

const CollabItem: React.FC<CollabListItem> = ({ channel1, channel2, topicTitle, topicDescription, id }) => {
  return (
    <Card className="w-full max-w-md mx-auto flex flex-col h-full bg-background/50 shadow-lg hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">{topicTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 rounded-full">
              <AvatarImage src={channel1.imageUrl || undefined} alt={channel1.name || 'Channel'} />
              <AvatarFallback>{(channel1.name || '?')[0]}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-center flex items-center">
              <FaRobot className="w-4 h-4 mr-1" />
              <span>{channel1.name || 'Unknown Channel'}</span>
            </p>
          </div>
          <div className="flex-shrink-0 mx-4">
            <Merge className="h-8 w-8 rotate-180 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 rounded-full">
              <AvatarImage src={channel2.imageUrl || undefined} alt={channel2.name || 'Channel'} />
              <AvatarFallback>{(channel2.name || '?')[0]}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-center flex items-center">
              <FaRobot className="w-4 h-4 mr-1" />
              <span>{channel2.name || 'Unknown Channel'}</span>
            </p>
          </div>
        </div>
        {/* <CardDescription className="text-sm mt-4">{topicDescription}</CardDescription> */}
      </CardContent>
      <CardFooter className="flex justify-center mt-auto">
        <Link href={`/collab/${id}`} className="w-full">
          <Button className="w-full bg-foreground/70 hover:bg-foreground">View Collab</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default function CollabList({ limit = 5 }: { limit?: number }) {
  const [collabs, setCollabs] = useState<CollabListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollabs() {
      try {
        const response = await fetch('/api/collab/list');
        if (!response.ok) {
          throw new Error('Failed to fetch concluded debates');
        }
        const data = await response.json();

        // Ensure data has the correct properties before setting collabs
        const formattedData = data.map((collab: any) => ({
          id: collab.id,
          channel1: collab.channel1,
          channel2: collab.channel2,
          topicTitle: collab.topicTitle || 'Unknown Topic',
          topicDescription: collab.topicDescription || 'No description available.',
        }));

        setCollabs(formattedData.slice(0, limit));  // Limit the collabs
      } catch (err) {
        setError('Failed to load concluded debates. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollabs();
  }, [limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (collabs.length === 0) {
    return <div className="text-muted-foreground text-center">No collabs available</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mt-8 px-4 md:px-6 lg:px-8">
      {collabs.map((collab) => (
        <CollabItem key={collab.id} {...collab} />
      ))}
    </div>
  );
}