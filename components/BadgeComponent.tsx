// components/BadgeComponent.tsx
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Award, Clock, Users, MessageSquare, Share2, Calendar, Star, Zap, Coffee, Brain } from "lucide-react";
import { BadgeType } from "@/utils/badgeManagement";
import { FaRobot } from "react-icons/fa6";

interface BadgeProps {
  type: BadgeType;
  count?: number;
}

const badgeConfig: Record<BadgeType, { name: string; icon: React.ReactNode; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }> = {
  founding: { name: "Founding Sponsor", icon: <Award className="h-4 w-4" />, rarity: 'legendary' },
  close: { name: "So Close", icon: <Clock className="h-4 w-4" />, rarity: 'uncommon' },
  'did-it': { name: "I Did It!", icon: <FaRobot className="h-4 w-4" />, rarity: 'rare' },
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
  'ai-whisperer': { name: "AI Whisperer", icon: <FaRobot className="h-4 w-4" />, rarity: 'legendary' },
};

export const BadgeComponent: React.FC<BadgeProps> = ({ type, count }) => {
  const { name, icon, rarity } = badgeConfig[type];

  return (
    <Badge variant="secondary" className={`mr-2 mb-2 ${getRarityClass(rarity)}`}>
      {icon}
      <span className="ml-1">{name}</span>
      {count && count > 1 && (
        <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs/3 ${getCountLabelClass(rarity)}`}>
          {count}
        </span>
      )}
    </Badge>
  );
};

const getCountLabelClass = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-800 text-gray-200';
    case 'uncommon': return 'bg-green-800 text-green-200';
    case 'rare': return 'bg-blue-800 text-blue-200';
    case 'epic': return 'bg-purple-800 text-purple-200';
    case 'legendary': return 'bg-yellow-800 text-yellow-200';
    default: return '';
  }
};

const getRarityClass = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105';
    case 'uncommon': return 'bg-green-200 text-green-800 hover:bg-green-300 hover:text-green-600 transition-all duration-300 ease-in-out transform hover:scale-105';
    case 'rare': return 'bg-blue-200 text-blue-800 hover:bg-blue-300 hover:text-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105';
    case 'epic': return 'bg-purple-200 text-purple-800 hover:bg-purple-300 hover:text-purple-600 transition-all duration-300 ease-in-out transform hover:scale-105';
    case 'legendary': return 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 hover:text-yellow-600 transition-all duration-300 ease-in-out transform hover:scale-105';
    default: return '';
  }
};