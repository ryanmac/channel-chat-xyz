// components/InterestsModal.tsx

import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog'; // Replace with your modal/dialog implementation
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface Interest {
  title: string;
  description: string;
}

interface InterestsModalProps {
  interests: Interest[];
  limit?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function InterestsModal({ interests, limit = interests.length, isOpen, onClose }: InterestsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Channel Interests</DialogTitle>
        <div className="space-y-4">
          {interests.slice(0, limit).map((interest, index) => (
            <div key={index}>
              <strong>{interest.title}:</strong> {interest.description}
            </div>
          ))}
          {interests.length > limit && (
            <p className="text-sm text-gray-500">Showing {limit} of {interests.length} interests.</p>
          )}
        </div>
        <DialogClose asChild>
          <Button className="mt-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}