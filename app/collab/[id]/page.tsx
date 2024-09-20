// app/collab/[id]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DebateInterface } from '@/components/DebateInterface';
import { Button } from '@/components/ui/button';
import { useDebate } from '@/hooks/useDebate';
import { Channel } from '@prisma/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';
import { FaRobot } from 'react-icons/fa6';

export default function DebatePage() {
  const { id } = useParams();
  const { debate, isLoading, error, loadDebate, processTurn, concludeDebate } = useDebate();
  const [channel1, setChannel1] = useState<Channel | null>(null);
  const [channel2, setChannel2] = useState<Channel | null>(null);
  const isLoadingChannels = useRef(false); // Ref to prevent multiple fetches

  // Load debate when the component mounts
  useEffect(() => {
    if (id) {
      loadDebate(id as string);
    }
  }, [id, loadDebate]);

  // Fetch channels only once after the debate is loaded
  useEffect(() => {
    const fetchChannels = async () => {
      if (!debate || isLoadingChannels.current || channel1 || channel2) return; // Prevent refetching if already loaded
      isLoadingChannels.current = true;
      try {
        const [c1, c2] = await Promise.all([
          fetch(`/api/channel/info?channelId=${debate.channelId1}`).then((res) => res.json()),
          fetch(`/api/channel/info?channelId=${debate.channelId2}`).then((res) => res.json()),
        ]);
        setChannel1(c1);
        setChannel2(c2);
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        isLoadingChannels.current = false;
      }
    };

    fetchChannels();
  }, [debate, channel1, channel2]);

  // Handle errors by displaying error messages
  if (error) {
    console.log('app/debate/[id]/page.tsx: error', error);
    return <div>Error: {error}</div>;
  }

  // Display a message if no debate is found
  if (!debate) {
    console.log('app/debate/[id]/page.tsx: no debate');
    return (
      <div className="flex justify-center items-center h-screen">
        <FaRobot className="w-16 h-16 animate-spin" />
      </div>
    );
  }

  // console.log('app/debate/[id]/page.tsx: debate.status', debate.status);
  // console.log('app/debate/[id]/page.tsx: debate.topic', debate.topic);

  return (
    <ErrorBoundary>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center text-primary">Collab</h1>
          <Link href="/collab" className="text-lg text-blue-500 hover:underline">
            <Button>
              Start New Collab
            </Button>
          </Link>
        </div>
        {channel1 && channel2 ? (
          <DebateInterface
            debate={debate}
            onTurn={processTurn}
            onConclude={concludeDebate}
            isLoading={isLoading}
            channel1={{
              name: channel1.name,
              imageUrl: channel1.imageUrl,
            }}
            channel2={{
              name: channel2.name,
              imageUrl: channel2.imageUrl,
            }}
          />
        ) : (
          <div>Loading channel information...</div>
        )}
      </div>
      <Footer />
    </ErrorBoundary>
  );
}