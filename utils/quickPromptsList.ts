import { 
  Lightbulb, Megaphone, Award, Camera, Clock, Laugh, UsersRound, MessageCircle, 
  Rocket, Sparkles, Popcorn, Tv, Brain, Mountain, LineChart, BookOpen, Heart, 
  HeartPulse, Scissors, CalendarCheck, Wrench, Flag, Eye, Gift, Archive, Film, 
  Users, Globe, Map, ThumbsDown, LucideIcon
} from 'lucide-react';

export interface QuickPrompt {
  text: string;
  icon: LucideIcon;
  prompt: string;
}

export const prompts: QuickPrompt[] = [
  { text: "Aha Moment", icon: Lightbulb, prompt: "What's the biggest 'aha moment' you've shared in your videos?" },
  { text: "Viral Potential", icon: Megaphone, prompt: "If you could make one of your videos go viral overnight, which one would it be and why?" },
  { text: "Best Of", icon: Award, prompt: "What's your personal favorite video you've ever made?" },
  { text: "Behind Scenes", icon: Camera, prompt: "Share a fascinating behind-the-scenes story from one of your videos." },
  { text: "Time Machine", icon: Clock, prompt: "If you could go back in time and give advice to yourself when you started your channel, what would you say?" },
  { text: "Blooper Reel", icon: Laugh, prompt: "What's the funniest blooper or mistake that's happened while filming?" },
  { text: "Crossover Dream", icon: UsersRound, prompt: "If you could collab with any other YouTuber, who would it be and what would you create?" },
  { text: "Fan Interaction", icon: MessageCircle, prompt: "What's the most memorable interaction you've had with a fan?" },
  { text: "Future Plans", icon: Rocket, prompt: "What exciting plans or projects are you working on for the future of your channel?" },
  { text: "Content Magic", icon: Sparkles, prompt: "If you had unlimited resources, what's the most ambitious video you'd create?" },
  { text: "Binge-Worthy", icon: Popcorn, prompt: "Suggest a perfect binge-watching order for your top 5 videos and why." },
  { text: "Channel Rewind", icon: Tv, prompt: "How has your content evolved since you started your channel? What's changed the most?" },
  { text: "Creative Block", icon: Brain, prompt: "How do you overcome creative blocks when planning new content?" },
  { text: "Biggest Challenge", icon: Mountain, prompt: "What has been the most challenging video to make and why?" },
  { text: "Unexpected Success", icon: LineChart, prompt: "Which of your videos unexpectedly performed well, and what do you think made it so popular?" },
  { text: "Learning Experience", icon: BookOpen, prompt: "What was the most valuable lesson you've learned from running your channel?" },
  { text: "Wish List", icon: Heart, prompt: "What's on your wishlist for equipment or tools to enhance your videos?" },
  { text: "Viewer Impact", icon: HeartPulse, prompt: "How have your videos impacted your viewers' lives in a meaningful way?" },
  { text: "Editing Hacks", icon: Scissors, prompt: "Share your favorite editing tricks or hacks that you use to enhance your videos." },
  { text: "Routine", icon: CalendarCheck, prompt: "What does your daily routine look like when working on your channel?" },
  { text: "Gear Check", icon: Wrench, prompt: "What equipment do you use to film and produce your videos?" },
  { text: "Milestone Moments", icon: Flag, prompt: "What are the most significant milestones you've achieved with your channel?" },
  { text: "Behind the Scenes", icon: Eye, prompt: "What do viewers not see behind the scenes when you are creating content?" },
  { text: "Subscriber Appreciation", icon: Gift, prompt: "How do you show appreciation to your subscribers and supporters?" },
  { text: "Idea Vault", icon: Archive, prompt: "Where do you keep track of all your content ideas?" },
  { text: "First Video Reflection", icon: Film, prompt: "Reflect on your first video. What would you do differently now?" },
  { text: "Audience Growth", icon: Users, prompt: "What's the most effective strategy you've found for growing your audience?" },
  { text: "Favorite Platform", icon: Globe, prompt: "Which social media platform has been the most valuable for promoting your videos?" },
  { text: "Long-Term Vision", icon: Map, prompt: "Where do you see your channel in the next five years?" },
  { text: "Community Building", icon: MessageCircle, prompt: "How do you build and nurture your community of viewers?" },
  { text: "Self-Critique", icon: ThumbsDown, prompt: "What's something you would critique about your own content?" },
];