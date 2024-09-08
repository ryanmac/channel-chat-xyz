// app/components/QuickPrompts.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, Megaphone, Award, Camera, Clock, Laugh, UsersRound, MessageCircle, 
  Rocket, Sparkles, Popcorn, Tv, Brain, Mountain, LineChart, BookOpen, Heart, 
  HeartPulse, Scissors, CalendarCheck, Wrench, Flag, Eye, Gift, Archive, Film, 
  Users, Globe, Map, ThumbsDown 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickPrompt {
  text: string;
  icon: React.ReactNode;
  prompt: string;
}

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

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onPromptSelect }) => {

  const prompts: QuickPrompt[] = [
    { text: "Aha Moment", icon: <Lightbulb className="w-4 h-4" />, prompt: "What's the biggest 'aha moment' you've shared in your videos?" },
    { text: "Viral Potential", icon: <Megaphone className="w-4 h-4" />, prompt: "If you could make one of your videos go viral overnight, which one would it be and why?" },
    { text: "Best Of", icon: <Award className="w-4 h-4" />, prompt: "What's your personal favorite video you've ever made?" },
    { text: "Behind Scenes", icon: <Camera className="w-4 h-4" />, prompt: "Share a fascinating behind-the-scenes story from one of your videos." },
    { text: "Time Machine", icon: <Clock className="w-4 h-4" />, prompt: "If you could go back in time and give advice to yourself when you started your channel, what would you say?" },
    { text: "Blooper Reel", icon: <Laugh className="w-4 h-4" />, prompt: "What's the funniest blooper or mistake that's happened while filming?" },
    { text: "Crossover Dream", icon: <UsersRound className="w-4 h-4" />, prompt: "If you could collab with any other YouTuber, who would it be and what would you create?" },
    { text: "Fan Interaction", icon: <MessageCircle className="w-4 h-4" />, prompt: "What's the most memorable interaction you've had with a fan?" },
    { text: "Future Plans", icon: <Rocket className="w-4 h-4" />, prompt: "What exciting plans or projects are you working on for the future of your channel?" },
    { text: "Content Magic", icon: <Sparkles className="w-4 h-4" />, prompt: "If you had unlimited resources, what's the most ambitious video you'd create?" },
    { text: "Binge-Worthy", icon: <Popcorn className="w-4 h-4" />, prompt: "Suggest a perfect binge-watching order for your top 5 videos and why." },
    { text: "Channel Rewind", icon: <Tv className="w-4 h-4" />, prompt: "How has your content evolved since you started your channel? What's changed the most?" },
    { text: "Creative Block", icon: <Brain className="w-4 h-4" />, prompt: "How do you overcome creative blocks when planning new content?" },
    { text: "Biggest Challenge", icon: <Mountain className="w-4 h-4" />, prompt: "What has been the most challenging video to make and why?" },
    { text: "Unexpected Success", icon: <LineChart className="w-4 h-4" />, prompt: "Which of your videos unexpectedly performed well, and what do you think made it so popular?" },
    { text: "Learning Experience", icon: <BookOpen className="w-4 h-4" />, prompt: "What was the most valuable lesson you've learned from running your channel?" },
    { text: "Wish List", icon: <Heart className="w-4 h-4" />, prompt: "What's on your wishlist for equipment or tools to enhance your videos?" },
    { text: "Viewer Impact", icon: <HeartPulse className="w-4 h-4" />, prompt: "How have your videos impacted your viewers' lives in a meaningful way?" },
    { text: "Editing Hacks", icon: <Scissors className="w-4 h-4" />, prompt: "Share your favorite editing tricks or hacks that you use to enhance your videos." },
    { text: "Routine", icon: <CalendarCheck className="w-4 h-4" />, prompt: "What does your daily routine look like when working on your channel?" },
    { text: "Gear Check", icon: <Wrench className="w-4 h-4" />, prompt: "What equipment do you use to film and produce your videos?" },
    { text: "Milestone Moments", icon: <Flag className="w-4 h-4" />, prompt: "What are the most significant milestones you've achieved with your channel?" },
    { text: "Behind the Scenes", icon: <Eye className="w-4 h-4" />, prompt: "What do viewers not see behind the scenes when you are creating content?" },
    { text: "Subscriber Appreciation", icon: <Gift className="w-4 h-4" />, prompt: "How do you show appreciation to your subscribers and supporters?" },
    { text: "Idea Vault", icon: <Archive className="w-4 h-4" />, prompt: "Where do you keep track of all your content ideas?" },
    { text: "First Video Reflection", icon: <Film className="w-4 h-4" />, prompt: "Reflect on your first video. What would you do differently now?" },
    { text: "Audience Growth", icon: <Users className="w-4 h-4" />, prompt: "What's the most effective strategy you've found for growing your audience?" },
    { text: "Favorite Platform", icon: <Globe className="w-4 h-4" />, prompt: "Which social media platform has been the most valuable for promoting your videos?" },
    { text: "Long-Term Vision", icon: <Map className="w-4 h-4" />, prompt: "Where do you see your channel in the next five years?" },
    { text: "Community Building", icon: <MessageCircle className="w-4 h-4" />, prompt: "How do you build and nurture your community of viewers?" },
    { text: "Self-Critique", icon: <ThumbsDown className="w-4 h-4" />, prompt: "What's something you would critique about your own content?" },
  ];

  const [randomPrompts, setRandomPrompts] = useState<QuickPrompt[]>(() => shuffleArray([...prompts]).slice(0, 4));

  const handlePromptSelect = (prompt: string) => {
    onPromptSelect(prompt);
    // Shuffle and update prompts only when a prompt is selected
    setRandomPrompts(shuffleArray([...prompts]).slice(0, 4));
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-0 w-full">
      {randomPrompts.map((prompt, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 w-full h-full py-2 px-3 text-sm"
                onClick={() => onPromptSelect(prompt.prompt)}
              >
                {prompt.icon}
                <span className="truncate">{prompt.text}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{prompt.prompt}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default QuickPrompts;