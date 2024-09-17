// components/QuickPrompts.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { prompts, QuickPrompt } from '@/utils/quickPromptsList';

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

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
    setRandomPrompts(shuffleArray([...prompts]).slice(0, 4));
  };

  return (
    // <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-1 sm:gap-2 mb-0 w-full">
    <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-0 w-full">
      {randomPrompts.map((prompt, index) => {
        const IconComponent = prompt.icon;
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  // className="flex items-center justify-center space-x-1 sm:space-x-2 w-full h-full py-1 px-2 sm:py-2 sm:px-3 text-xs sm:text-sm"
                  className="flex items-center justify-center space-x-1 w-full max-h-12 py-1 px-2 text-xs"
                  onClick={() => handlePromptSelect(prompt.prompt)}
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{prompt.text}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[20rem] custom-prose bg-accent text-gray-800 dark:text-gray-200">
                <p>{prompt.prompt}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}