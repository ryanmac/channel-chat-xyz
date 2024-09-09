// components/ui/progress-bar.tsx
import React from 'react';

export type ProgressItem = {
  value: number;
  className?: string;
};

export type ProgressProps = {
  items: ProgressItem[];
  height?: string;
  className?: string;
};

const calculateWidths = (items: ProgressItem[]): ProgressItem[] => {
  let total = 0;
  return items
    .map((item) => {
      const width = Math.min(item.value, 100 - total);
      total += width;
      return { ...item, value: width };
    })
    .filter((item) => item.value > 0);
};

const ProgressBar = ({
  items,
  height = 'h-4',
  className = '',
}: ProgressProps) => {
  const progressItems = calculateWidths(items);

  return (
    <div
      className={`w-full ${height} bg-gray-500 rounded-full overflow-hidden ${className}`}
    >
      {progressItems.map((item, index) => (
        <div
          key={index}
          className={`h-full ${item.className || 'bg-blue-500'}`}
          style={{ width: `${item.value}%`, float: 'left' }}
        />
      ))}
    </div>
  );
};

export default ProgressBar;

/**
Example usage
function Component() {
  return (
    <div className="space-y-4 p-4">
      <ProgressBar items={[{ value: 30 }]} />
      <ProgressBar items={[
        { value: 30, className: 'bg-blue-500' },
        { value: 20, className: 'bg-red-500' }
      ]} />
      <ProgressBar items={[
        { value: 30, className: 'bg-blue-500' },
        { value: 20, className: 'bg-red-500' },
        { value: 10, className: 'bg-green-500' }
      ]} />
      <ProgressBar items={[
        { value: 30, className: 'bg-blue-500' },
        { value: 20, className: 'bg-red-500' },
        { value: 60, className: 'bg-green-500' }
      ]} />
      <ProgressBar 
        items={[
          { value: 40, className: 'bg-purple-500' },
          { value: 30, className: 'bg-yellow-500' },
          { value: 20, className: 'bg-pink-500' },
          { value: 10, className: 'bg-cyan-500' }
        ]}
        height="h-8"
        className="shadow-lg"
      />
    </div>
  )
}
*/