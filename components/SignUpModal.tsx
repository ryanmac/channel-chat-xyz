// components/SignUpModal.tsx
'use client'

import React, { useState } from 'react';
import { X, Mail, Lock, Award, MessageSquare, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call your custom API endpoint to create the user
      const res = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Sign in the user with the new credentials
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.error) {
          onClose(); // Close modal on successful sign up
        } else {
          setError(result.error);
        }
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
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
              <h2 className="text-3xl font-extrabold text-center mb-6">
                Create your account
              </h2>
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white text-purple-600 hover:bg-purple-100 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
              {error && (
                <p className="text-red-500 text-center mt-4">{error}</p>
              )}
              <div className="mt-8">
                <p className="text-lg font-semibold text-center mb-4">
                  By signing up, you'll be able to:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Award className="h-5 w-5 mr-3 text-yellow-300" />
                    <span>Save your earned badges</span>
                  </li>
                  <li className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-3 text-green-300" />
                    <span>Get longer responses on ALL ChannelChat channels</span>
                  </li>
                  <li className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-3 text-blue-300" />
                    <span>Easily manage your contributions and privileges</span>
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