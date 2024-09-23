// components/TopicSelection.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaRobot } from 'react-icons/fa';

interface TopicSelectionProps {
  topics: { title: string; description: string }[];
  onSelect: (topic: string) => void;
  isLoading: boolean;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ topics, onSelect, isLoading }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Select a Topic</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-all hover:shadow-lg dark:bg-gray-800/80 dark:border-gray-700 flex flex-col"
          >
            <CardHeader className="p-4 flex-grow">
              <CardTitle className="text-xl font-bold">{topic.title}</CardTitle>
              {topic.description && (
                <p className="text-md text-muted-foreground mt-1">{topic.description}</p>
              )}
            </CardHeader>
            <CardContent className="p-4 mt-auto">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => onSelect(topic.title)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaRobot className="mr-2 h-4 w-4 animate-spin" />
                    Initiating...
                  </>
                ) : (
                  "Select"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};