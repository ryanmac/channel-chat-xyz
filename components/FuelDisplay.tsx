// components/FuelDisplay.tsx
'use client';

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

interface FuelDisplayProps {
  channelId: string;
}

export function FuelDisplay({ channelId }: FuelDisplayProps) {
  const [fuelData, setFuelData] = useState({ percentage: 0, credits: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFuelData() {
      if (!channelId) {
        setError('Channel ID is missing');
        return;
      }

      try {
        const response = await fetch(`/api/fuel/info?channelid=${channelId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch fuel data');
        }
        const data = await response.json();
        setFuelData(data);
      } catch (err) {
        console.error('Error fetching fuel data:', err);
        setError('Failed to load fuel data');
      }
    }
    fetchFuelData();
  }, [channelId]);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>;
  }

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Fuel</h3>
      <Progress value={fuelData.percentage} className="w-full" />
      <p className="text-sm mt-1">{fuelData.percentage.toFixed(2)}%</p>
      <p className="text-sm mt-1">Credits: {fuelData.credits}</p>
    </div>
  )
}