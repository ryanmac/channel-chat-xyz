// hooks/useSessionBadges.ts
import { useState, useCallback } from 'react';
import { BadgeType } from '@/utils/badgeManagement';
import { createFetchSessionBadges } from '@/utils/badgeManagement';

export const useSessionBadges = (sessionId: string | null) => {
  const [earnedBadges, setEarnedBadges] = useState<BadgeType[]>([]);

  const fetchSessionBadges = useCallback(async () => {
    if (!sessionId) return;
    try {
      const badges = await createFetchSessionBadges(sessionId);
      setEarnedBadges(badges);
    } catch (error) {
      console.error('Error fetching session badges:', error);
    }
  }, [sessionId]);

  return { earnedBadges, fetchSessionBadges };
};