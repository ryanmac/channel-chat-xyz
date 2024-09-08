// app/components/BadgeComponent.tsx
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Award, Bot, Clock, Users, MessageSquare, Share2, Calendar, Star, Zap, Coffee, Brain } from "lucide-react";

export type BadgeType = 
  'founding' | 'close' | 'did-it' | 'activator' | 'chad' | 'giga-chad' |
  'chatterbox' | 'viral' | 'loyal-fan' | 'early-bird' | 'night-owl' |
  'multi-channel' | 'curious-mind' | 'insight-seeker' | 'conversation-starter' |
  'fact-checker' | 'trendsetter' | 'ai-whisperer';

interface BadgeProps {
  type: BadgeType;
}

const badgeConfig: Record<BadgeType, { name: string; icon: React.ReactNode; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }> = {
  founding: { name: "Founding Sponsor", icon: <Award className="h-4 w-4" />, rarity: 'legendary' },
  close: { name: "So Close", icon: <Clock className="h-4 w-4" />, rarity: 'uncommon' },
  'did-it': { name: "I Did It!", icon: <Bot className="h-4 w-4" />, rarity: 'rare' },
  activator: { name: "Activator", icon: <Users className="h-4 w-4" />, rarity: 'epic' },
  chad: { name: "Chad", icon: <Award className="h-4 w-4" />, rarity: 'epic' },
  'giga-chad': { name: "Giga Chad", icon: <Award className="h-4 w-4" />, rarity: 'legendary' },
  chatterbox: { name: "Chatterbox", icon: <MessageSquare className="h-4 w-4" />, rarity: 'common' },
  viral: { name: "Going Viral", icon: <Share2 className="h-4 w-4" />, rarity: 'rare' },
  'loyal-fan': { name: "Loyal Fan", icon: <Calendar className="h-4 w-4" />, rarity: 'uncommon' },
  'early-bird': { name: "Early Bird", icon: <Clock className="h-4 w-4" />, rarity: 'uncommon' },
  'night-owl': { name: "Night Owl", icon: <Clock className="h-4 w-4" />, rarity: 'uncommon' },
  'multi-channel': { name: "Channel Surfer", icon: <Zap className="h-4 w-4" />, rarity: 'rare' },
  'curious-mind': { name: "Curious Mind", icon: <Brain className="h-4 w-4" />, rarity: 'common' },
  'insight-seeker': { name: "Insight Seeker", icon: <Star className="h-4 w-4" />, rarity: 'uncommon' },
  'conversation-starter': { name: "Conversation Starter", icon: <MessageSquare className="h-4 w-4" />, rarity: 'common' },
  'fact-checker': { name: "Fact Checker", icon: <Coffee className="h-4 w-4" />, rarity: 'rare' },
  trendsetter: { name: "Trendsetter", icon: <Zap className="h-4 w-4" />, rarity: 'epic' },
  'ai-whisperer': { name: "AI Whisperer", icon: <Bot className="h-4 w-4" />, rarity: 'legendary' },
};

export const BadgeComponent: React.FC<BadgeProps> = ({ type }) => {
  const { name, icon, rarity } = badgeConfig[type];

  return (
    <Badge variant="secondary" className={`mr-2 mb-2 ${getRarityClass(rarity)}`}>
      {icon}
      <span className="ml-1">{name}</span>
    </Badge>
  );
};

const getRarityClass = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-200 text-gray-800';
    case 'uncommon': return 'bg-green-200 text-green-800';
    case 'rare': return 'bg-blue-200 text-blue-800';
    case 'epic': return 'bg-purple-200 text-purple-800';
    case 'legendary': return 'bg-yellow-200 text-yellow-800';
    default: return '';
  }
};

export const determineBadges = (
  numericAmount: number,
  fundingToGoal: number,
  remainingToActivate: number,
  isFirstSponsor: boolean,
  userStats: UserStats
): BadgeType[] => {
  const badges = new Set<BadgeType>();

  // Existing badge logic
  if (isFirstSponsor || remainingToActivate <= 10) {
    badges.add('founding');
  }

  if (numericAmount > 0 && (remainingToActivate - numericAmount) <= 5 && (remainingToActivate - numericAmount) > 0) {
    badges.add('close');
  }

  if (numericAmount >= remainingToActivate) {
    badges.add('did-it');
  }

  if (numericAmount > remainingToActivate) {
    badges.add('activator');
  }

  if (numericAmount >= remainingToActivate + 40) {
    badges.add('chad');
  }

  if (numericAmount >= remainingToActivate + 80) {
    badges.add('giga-chad');
  }

  // New badge logic
  if (userStats.totalChats >= 100) badges.add('chatterbox');
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