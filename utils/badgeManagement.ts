// utils/badgeManagement.ts

interface UserStats {
  totalChats: number;
  shares: number;
  daysActive: number;
  earlyMorningChats: number;
  lateNightChats: number;
  uniqueChannels: number;
  uniqueQueries: number;
  longConversations: number;
  conversationsStarted: number;
  factChecks: number;
  trendingConversations: number;
  complexQueries: number;
}

export type BadgeType = 
  'founding' | 'close' | 'did-it' | 'activator' | 'chad' | 'giga-chad' |
  'chatterbox' | 'viral' | 'loyal-fan' | 'early-bird' | 'night-owl' |
  'multi-channel' | 'curious-mind' | 'insight-seeker' | 'conversation-starter' |
  'fact-checker' | 'trendsetter' | 'ai-whisperer';

export const determineBadges = (
  numericAmount: number,
  fundingToGoal: number,
  remainingToActivate: number,
  isFirstSponsor: boolean,
  userStats: UserStats
): BadgeType[] => {
  const badges = new Set<BadgeType>();

  // Refined badge logic
  if (isFirstSponsor || (remainingToActivate <= 10 && fundingToGoal != 0)) {
    badges.add('founding');
  }

  if (numericAmount > 0 && (remainingToActivate - numericAmount) > 0 && (remainingToActivate - numericAmount) <= 5) {
    badges.add('close');
  }

  if (numericAmount >= remainingToActivate && remainingToActivate > 0) {
    badges.add('did-it');
  }

  if (numericAmount > remainingToActivate && remainingToActivate > 0) {
    badges.add('activator');
  }

  if ((numericAmount >= remainingToActivate + 40 && remainingToActivate > 0) || numericAmount >= 40) {
    badges.add('chad');
  }

  if ((numericAmount >= remainingToActivate + 80 && remainingToActivate > 0) || numericAmount >= 80) {
    badges.add('giga-chad');
  }

  // New badge logic based on user stats
  if (userStats.totalChats >= 10000) badges.add('chatterbox');
  if (userStats.shares >= 50) badges.add('viral');
  if (userStats.daysActive >= 30) badges.add('loyal-fan');
  if (userStats.earlyMorningChats >= 20) badges.add('early-bird');
  if (userStats.lateNightChats >= 20) badges.add('night-owl');
  if (userStats.uniqueChannels >= 5) badges.add('multi-channel');
  if (userStats.uniqueQueries >= 50) badges.add('curious-mind');
  if (userStats.longConversations >= 10) badges.add('insight-seeker');
  if (userStats.conversationsStarted >= 30) badges.add('conversation-starter');
  if (userStats.factChecks >= 20) badges.add('fact-checker');
  if (userStats.trendingConversations >= 5) badges.add('trendsetter');
  if (userStats.complexQueries >= 50) badges.add('ai-whisperer');

  return Array.from(badges);
};

// utils/badgeManagement.ts
export const createFetchSessionBadges = async (sessionId: string): Promise<BadgeType[]> => {
  const response = await fetch(`/api/badges/session?sessionId=${sessionId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch session badges: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.badges ? data.badges.split(',') : [];
};