import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { prompts, QuickPrompt } from '@/utils/quickPromptsList';

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

// Helper function to shuffle the array
const shuffleArray = (array: QuickPrompt[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function QuickPrompts({ onPromptSelect }: QuickPromptsProps) {
  const [randomPrompts, setRandomPrompts] = useState<QuickPrompt[]>(() => shuffleArray([...prompts]).slice(0, 4));

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    // Shuffle and update prompts only when a prompt is selected
    setRandomPrompts(shuffleArray([...prompts]).slice(0, 4));
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-0 w-full">
      {randomPrompts.map((prompt, index) => {
        const IconComponent = prompt.icon;
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center space-x-2 w-full h-full py-2 px-3 text-sm"
                  onClick={() => handlePromptSelect(prompt.prompt)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="truncate">{prompt.text}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{prompt.prompt}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}