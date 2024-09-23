// components/SignUpModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, Award, MessageSquare, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BadgeComponent } from '@/components/BadgeComponent';
import { BadgeType } from '@/utils/badgeManagement';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/next-auth/auth-provider'; // Use custom useSession

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: BadgeType[];
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, badges }) => {
  const { session, status } = useSession(); // Use session and status from custom useSession
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (status === 'authenticated' && sessionId) {
      transferBadges();
    }
  }, [status, sessionId]);

  const transferBadges = async () => {
    console.log(`Attempting to transfer badges for session ${sessionId} and user ${session?.user?.id}`);
    try {
      const response = await fetch('/api/badges/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
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

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google');
    } catch (error) {
      console.error('Google sign-in failed', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-full max-w-xl bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-8 text-white">
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Button>
              <h2 className="text-3xl font-extrabold text-center mb-6">Create your account</h2>
              <div className="space-y-6">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-6/12 mx-auto bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-300 flex items-center justify-center"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Google Sign In
                </Button>
              </div>
              <div className="mt-8">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-3 text-green-300" />
                    <span>Get longer responses on <strong>all</strong> ChannelChat channels</span>
                  </li>
                  <li className="flex flex-col items-start">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-3 text-yellow-300" />
                      <span>Save your badges!</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 pl-8">
                      {badges.map((badge) => (
                        <BadgeComponent key={badge} type={badge} />
                      ))}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};