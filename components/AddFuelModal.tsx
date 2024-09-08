// components/AddFuelModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AddFuelModalProps {
  channelId: string;
  onFuelAdded: () => void;
}

export function AddFuelModal({ channelId, onFuelAdded }: AddFuelModalProps) {
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFuel = async () => {
    setIsAdding(true);
    try {
      const response = await fetch('/api/fuel/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId, amountInDollars: parseFloat(amount) }),
      });

      if (!response.ok) {
        throw new Error('Failed to add fuel');
      }

      onFuelAdded();
    } catch (error) {
      console.error('Failed to add fuel:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Fuel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Fuel</DialogTitle>
        </DialogHeader>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in dollars"
        />
        <Button onClick={handleAddFuel} disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add Fuel'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}