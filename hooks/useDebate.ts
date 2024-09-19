// hooks/useDebate.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Debate, DebateTurn } from '@prisma/client';
import { toast } from '@/hooks/use-toast';
import config from '@/config';

interface ExtendedDebate extends Debate {
  topics?: string[];
  turns: DebateTurn[];
}

const MAX_TURNS = 10;

export function useDebate() {
  const [debate, setDebate] = useState<ExtendedDebate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingTurn, setProcessingTurn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // Ref to manage request cancellation

  const initializeDebate = useCallback(async (channelId1: string, channelId2: string, topic: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.app.url}/api/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize', channelId1, channelId2, topic }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDebate(data);
      return data;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error occurred';
      setError('Failed to initialize debate. Please try again.');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDebate = useCallback(async (debateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.app.url}/api/debate?id=${debateId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDebate(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error occurred';
      setError('Failed to load debate. Please try again.');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processTurn = useCallback(async (debateId: string, content: string) => {
    // Prevent starting a new turn if one is already being processed
    if (processingTurn) {
      console.warn('Turn already processing, skipping new request.');
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('Previous request aborted.');
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setProcessingTurn(true);
    setIsLoading(true); // Set isLoading to true when starting to process
    setError(null);

    try {
      console.log('Processing turn for debate:', debateId);
      const response = await fetch(`${config.app.url}/api/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'turn', debateId, content }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Turn processed successfully:', data);
      setDebate(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          console.log('Turn processing aborted');
        } else {
          const message = e.message || 'Unknown error occurred';
          setError('Failed to process turn. Please try again.');
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          });
        }
      }
    } finally {
      setProcessingTurn(false);
      setIsLoading(false); // Ensure isLoading is set back to false after processing
      abortControllerRef.current = null; // Clear the controller reference
    }
  }, [processingTurn]);

  const concludeDebate = useCallback(async (debateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Concluding debate:', debateId);
      const response = await fetch(`${config.app.url}/api/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'conclude', debateId }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDebate(data);
      toast({
        title: 'Debate Concluded',
        description: 'The debate has been successfully concluded.',
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error occurred';
      setError('Failed to conclude debate. Please try again.');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debate && debate.status === 'IN_PROGRESS' && Array.isArray(debate.turns) && debate.turns.length < MAX_TURNS) {
      const processNextTurn = async () => {
        if (!debate.id || processingTurn) {
          console.warn('Turn already processing or debate ID missing, skipping processing.');
          return; // Prevent processing if a turn is already being processed or debate ID is missing
        }
        try {
          console.log('Initiating next turn processing...');
          setIsLoading(true);
          await processTurn(debate.id, '');
        } catch (error) {
          console.error('Error processing turn:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const timer = setTimeout(processNextTurn, 1000); // Start with a slight delay to avoid immediate execution issues
      return () => clearTimeout(timer);
    }
  }, [debate, processTurn, processingTurn]);

  return { debate, isLoading, error, initializeDebate, loadDebate, processTurn, concludeDebate };
}