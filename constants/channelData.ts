// constants/channelData.ts
import { ChannelData } from '@/utils/channelManagement';

export const defaultChannelData: ChannelData = {
  id: '',
  name: '',
  title: '404 Testing Channel',
  description: 'Channel not found.',
  subscriberCount: '0',
  videoCount: '0',
  viewCount: '0',
  imageUrl: '/placeholder.svg?height=100&width=100&text=Profile',
  bannerUrl: '/placeholder.svg?height=200&width=1000&text=Channel+Banner',
  status: 'PENDING',
  activationFunding: 0,
  activationGoal: 0,
  creditBalance: 0,
  isProcessing: false,
  totalEmbeddings: 0,
  totalVideos: 0,
  model: 'gpt-4o-mini',
  maxTokens: 200,
  chatsCreated: 0,
  isFineTuned: false,
  botScore: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  featured: false,
  interests: [],
  metadata: {
    snippet: {
      title: '404 Title',
      description: '404 Description',
      thumbnails: {
        default: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
        high: { url: '/placeholder.svg?height=100&width=100&text=Profile' },
      },
      customUrl: '@404TestingChannel',
      localized: {
        title: '404 Title',
        description: '404 Description',
      },
      country: 'USA',
    },
    statistics: {
      subscriberCount: '0',
      viewCount: '0',
      videoCount: '0',
    },
    brandingSettings: {
      image: {
        bannerExternalUrl: '/placeholder.svg?height=200&width=1000&text=Channel+Banner',
      },
    },
  },
};