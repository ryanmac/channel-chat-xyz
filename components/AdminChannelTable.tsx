// components/AdminChannelTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
  subscriberCount: string | null;
  videoCount: string | null;
  activationFunding: string | null;
  creditBalance: string | null;
  totalEmbeddings: string | null;
  totalVideos: string | null;
  chatsCreated: string | null;
  isProcessing: boolean;
  status: string;
}

type SortColumn = keyof Channel;

export default function AdminChannelTable() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // State variables for boost functionality
  const [boostAmounts, setBoostAmounts] = useState<{ [key: string]: string }>({});
  const [boostLoading, setBoostLoading] = useState<{ [key: string]: boolean }>({});

  const fetchChannels = async () => {
    try {
      const response = await fetch(
        `/api/admin/channels?search=${encodeURIComponent(searchTerm)}&sort=${sortColumn}&direction=${sortDirection}&page=${page}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      const data = await response.json();
      setChannels(data.channels);
      setTotalPages(data.totalPages || 1);

      // Initialize boostAmounts with default '1' for any new channels
      setBoostAmounts((prevBoostAmounts) => {
        const newBoostAmounts = { ...prevBoostAmounts };
        data.channels.forEach((channel: Channel) => {
          if (!(channel.id in newBoostAmounts)) {
            newBoostAmounts[channel.id] = '1';
          }
        });
        return newBoostAmounts;
      });
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to fetch channels. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [searchTerm, sortColumn, sortDirection, page]);

  // Polling for channels that are processing
  useEffect(() => {
    const processingChannels = channels.some(channel => channel.isProcessing);
    if (processingChannels) {
      const intervalId = setInterval(() => {
        fetchChannels();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [channels]);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleProcessChannel = async (channelId: string, channelName: string) => {
    try {
      // Optimistically set isProcessing to true
      setChannels(prevChannels =>
        prevChannels.map(channel =>
          channel.id === channelId ? { ...channel, isProcessing: true } : channel
        )
      );

      const response = await fetch('/api/admin/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, amount: 0, type: 'PROCESS' }),
      });

      if (!response.ok) {
        throw new Error('Failed to process channel');
      }

      toast({
        title: "Channel Processing Started",
        description: `Processing started for ${channelName}`,
      });

      fetchChannels();
    } catch (error) {
      // Revert isProcessing to false in case of error
      setChannels(prevChannels =>
        prevChannels.map(channel =>
          channel.id === channelId ? { ...channel, isProcessing: false } : channel
        )
      );

      toast({
        title: "Error",
        description: "Failed to process channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBoost = async (channelId: string, channelName: string, channelStatus: string) => {
    const amount = boostAmounts[channelId];

    if (!amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    const type = channelStatus === 'PENDING' ? 'ACTIVATION' : 'CREDIT_PURCHASE';

    setBoostLoading((prev) => ({ ...prev, [channelId]: true }));
    try {
      const response = await fetch('/api/admin/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, amount: parseFloat(amount), type }),
      });

      if (!response.ok) {
        throw new Error('Failed to boost channel');
      }

      toast({
        title: "Channel Boosted",
        description: `Successfully added $${amount} to ${channelName} as ${type}`,
      });

      fetchChannels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to boost channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBoostLoading((prev) => ({ ...prev, [channelId]: false }));
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Channels</h2>
      <Input
        placeholder="Search channels"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')}>
              Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('status')}>
              Status {sortColumn === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Boost</TableHead>
            <TableHead onClick={() => handleSort('subscriberCount')}>
              Subscribers {sortColumn === 'subscriberCount' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('videoCount')}>
              Videos {sortColumn === 'videoCount' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('activationFunding')}>
              Activation Funding {sortColumn === 'activationFunding' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('creditBalance')}>
              Credit Balance {sortColumn === 'creditBalance' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('totalEmbeddings')}>
              Total Embeddings {sortColumn === 'totalEmbeddings' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('totalVideos')}>
              Total Channel Videos {sortColumn === 'totalVideos' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
            <TableHead onClick={() => handleSort('chatsCreated')}>
              Chats Created {sortColumn === 'chatsCreated' && (sortDirection === 'asc' ? '▲' : '▼')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((channel) => (
            <TableRow key={channel.id}>
              <TableCell>
                <Link href={`/channel/@${channel.name}`}>
                  {channel.name}
                </Link>
              </TableCell>
              <TableCell>{channel.status}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleProcessChannel(channel.id, channel.name)}
                  disabled={channel.isProcessing || channel.status !== 'ACTIVE'}
                  className="px-2 py-1 text-xs bg-accent border-input border text-gray-800 dark:text-white"
                >
                  {channel.isProcessing ? (
                    <>
                      <Spinner />
                    </>
                  ) : (
                    'Process'
                  )}
                </Button>
              </TableCell>
              <TableCell>
                {channel.status === 'PENDING' || channel.status === 'ACTIVE' ? (
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={boostAmounts[channel.id]}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBoostAmounts((prev) => ({ ...prev, [channel.id]: value }));
                      }}
                      className="w-16 mr-2 ml-1"
                      placeholder="Amount"
                    />
                    <Button
                      onClick={() => handleBoost(channel.id, channel.name, channel.status)}
                      disabled={boostLoading[channel.id]}
                      className="px-2 py-1 text-xs bg-accent border-input border text-gray-800 dark:text-white"
                    >
                      {boostLoading[channel.id] ? (
                        <>
                          <Spinner />
                        </>
                      ) : (
                        channel.status === 'PENDING' ? 'Activate' : 'Credits'
                      )}
                    </Button>
                  </div>
                ) : (
                  <span>N/A</span>
                )}
              </TableCell>
              <TableCell>
                {channel.subscriberCount
                  ? Number(channel.subscriberCount).toLocaleString()
                  : '0'}
              </TableCell>
              <TableCell>
                {channel.videoCount ? Number(channel.videoCount) : '0'}
              </TableCell>
              <TableCell>
                {channel.activationFunding
                  ? `$${Number(channel.activationFunding).toFixed(0)}`
                  : '$0'}
              </TableCell>
              <TableCell>
                {channel.creditBalance
                  ? Number(channel.creditBalance).toLocaleString()
                  : '0'}
              </TableCell>
              <TableCell>
                {channel.totalEmbeddings
                  ? Number(channel.totalEmbeddings).toLocaleString()
                  : '0'}
              </TableCell>
              <TableCell>
                {channel.totalVideos
                  ? Number(channel.totalVideos).toLocaleString()
                  : '0'}
              </TableCell>
              <TableCell>
                {channel.chatsCreated
                  ? Number(channel.chatsCreated).toLocaleString()
                  : '0'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between">
        <Button
          onClick={() => setPage(page - 1)} disabled={page === 1}
          className="px-2 py-1 text-xs bg-accent border-input border text-gray-800 dark:text-white"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage(page + 1)} disabled={page === totalPages}
          className="px-2 py-1 text-xs bg-accent border-input border text-gray-800 dark:text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}