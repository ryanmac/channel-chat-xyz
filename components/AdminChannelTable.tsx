// components/AdminChannelTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { RotateCcw, Info } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { abbreviateNumber, parseAbbreviatedNumber } from '@/utils/numberUtils';
import ReactMarkdown from 'react-markdown'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Channel {
  id: string;
  name: string;
  imageUrl: string;
  subscriberCount: string | null;
  videoCount: string | null;
  activationFunding: string | null;
  creditBalance: string | null;
  totalEmbeddings: string | null;
  totalVideos: string | null;
  chatsCreated: string | null;
  isProcessing: boolean;
  status: string;
  interests: string;
  featured: boolean;
}

type SortColumn = keyof Channel;

export default function AdminChannelTable() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const [boostAmounts, setBoostAmounts] = useState<{ [key: string]: string }>({});
  const [boostLoading, setBoostLoading] = useState<{ [key: string]: boolean }>({});
  const [interestsLoading, setInterestsLoading] = useState<{ [key: string]: boolean }>({});

  const fetchChannels = async () => {
    try {
      const response = await fetch(
        `/api/admin/channels?search=${encodeURIComponent(searchTerm)}&sort=${sortColumn}&direction=${sortDirection}&page=${page}&pageSize=${pageSize}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      const data = await response.json();
      setChannels(data.channels);
      setTotalPages(data.totalPages || 1);

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
  }, [searchTerm, sortColumn, sortDirection, page, pageSize]);  // Include pageSize in the dependency array

  useEffect(() => {
    if (filterStatus) {
      setFilteredChannels(channels.filter(channel => channel.status === filterStatus));
    } else {
      setFilteredChannels(channels);
    }
  }, [channels, filterStatus]);

  const handleFilterChange = (status: string | null) => {
    setFilterStatus(status);
    setPage(1); // Reset to first page whenever filter changes
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);  // Reset to first page whenever page size changes
  };

  useEffect(() => {
    const processingChannels = channels.some(channel => channel.isProcessing);
    if (processingChannels) {
      const intervalId = setInterval(() => {
        fetchChannels();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [channels]);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const sortedChannels = [...filteredChannels].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
  
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
  
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (['subscriberCount', 'videoCount', 'activationFunding', 'creditBalance', 'totalEmbeddings', 'totalVideos', 'chatsCreated'].includes(sortColumn)) {
        const aNum = parseAbbreviatedNumber(aValue);
        const bNum = parseAbbreviatedNumber(bValue);
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    }
  
    // Fallback for any other type of comparison
    return sortDirection === 'asc' 
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  const handleProcessChannel = async (channelId: string, channelName: string) => {
    try {
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

  const handleFeature = async (channelId: string, channelName: string) => {
    const updatedChannelAfterFeature = await fetch('/api/admin/feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName }),
    });

    if (!updatedChannelAfterFeature.ok) {
      toast({
        title: "Error",
        description: "Failed to feature channel. Please try again.",
        variant: "destructive",
      });
      return;
    } else {
      toast({
        title: "Channel Featured",
        description: `Successfully featured ${channelName}`,
      });
    }

    fetchChannels();
  }

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

  const handleRefreshInterests = async (channelId: string, channelName: string) => {
    setInterestsLoading((prev) => ({ ...prev, [channelId]: true }));

    try {
      const response = await fetch(`/api/channel/interests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelData: { id: channelId, name: channelName } }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh channel interests');
      }

      const data = await response.json();
      const { response: interestsResponse } = data;

      toast({
        title: "Interests Updated",
        description: `Successfully updated interests for ${channelName}: ${interestsResponse}`,
      });

      fetchChannels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh channel interests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInterestsLoading((prev) => ({ ...prev, [channelId]: false }));
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Channels</h2>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleFilterChange(null)}
            className={`px-2 py-1 ${filterStatus === null ? 'bg-accent' : 'bg-background'} border-input border text-gray-800 dark:text-white hover:bg-accent`}
          >
            All
          </Button>
          <Button
            onClick={() => handleFilterChange('ACTIVE')}
            className={`px-2 py-1 ${filterStatus === 'ACTIVE' ? 'bg-accent' : 'bg-background'} border-input border text-gray-800 dark:text-white hover:bg-accent`}
          >
            Active
          </Button>
          <Button
            onClick={() => handleFilterChange('PENDING')}
            className={`px-2 py-1 ${filterStatus === 'PENDING' ? 'bg-accent' : 'bg-background'} border-input border text-gray-800 dark:text-white hover:bg-accent`}
          >
            Pending
          </Button>
        </div>
        <Input
          placeholder="Search channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-full"
        />
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="p-2 border rounded h-full"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
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
            <TableHead>Interests</TableHead>
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
          {sortedChannels.map((channel) => (
            <TableRow key={channel.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8 rounded-full">
                    <AvatarImage src={channel.imageUrl} alt={channel.name} />
                    <AvatarFallback>{channel.name[0]}</AvatarFallback>
                  </Avatar>
                  <Link href={`/channel/@${channel.name}`}>
                    {channel.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                {channel.status === 'ACTIVE' ? (
                  <Button
                    onClick={() => handleFeature(channel.id, channel.name)}
                    className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
                  >
                    {channel.featured ? 'Unfeature' : 'Feature'}
                  </Button>
                ) : (
                  <span className="text-gray-500">Pending</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleProcessChannel(channel.id, channel.name)}
                  disabled={channel.isProcessing || channel.status !== 'ACTIVE'}
                  className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
                >
                  {channel.isProcessing ? (
                    <>
                      <Spinner className="w-4 h-4" />
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
                      className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
                    >
                      {boostLoading[channel.id] ? (
                        <>
                          <Spinner className="w-4 h-4" />
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleRefreshInterests(channel.id, channel.name)}
                        disabled={interestsLoading[channel.id]}
                        className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
                      >
                        {interestsLoading[channel.id] ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[20rem] custom-prose bg-accent text-gray-800 dark:text-gray-200">
                      <p>
                        <ReactMarkdown>
                          {channel.interests || "No interests available"}
                        </ReactMarkdown>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                {channel.subscriberCount
                  ? abbreviateNumber(parseInt(channel.subscriberCount))
                  : '0'}
              </TableCell>
              <TableCell>
                {channel.videoCount ? abbreviateNumber(parseInt(channel.videoCount)) : '0'}
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
          className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage(page + 1)} disabled={page === totalPages}
          className="px-2 py-1 text-xs bg-background border-input border text-gray-800 dark:text-white hover:bg-accent"
        >
          Next
        </Button>
      </div>
    </div>
  );
}