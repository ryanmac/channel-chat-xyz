// hooks/useBadgeTransfer.ts
import { useEffect, useRef } from 'react';

export function useBadgeTransfer(sessionId: string | null, userId: string | undefined) {
  const transferAttemptedRef = useRef(false); // Ref to track if transfer was attempted

  const transferBadges = async () => {
    if (!sessionId || !userId || transferAttemptedRef.current) return; // Prevent multiple calls
    transferAttemptedRef.current = true;

    console.log(`Attempting to transfer badges for session ${sessionId} to user ${userId}`);

    try {
      const response = await fetch('/api/badges/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transfer badges');
      }

      const result = await response.json();
      console.log('Badge transfer result:', result);
    } catch (error) {
      console.error('Error transferring badges:', error);
    }
  };

  useEffect(() => {
    transferBadges();
  }, [sessionId, userId]); // Trigger the transfer when sessionId and userId are available
}