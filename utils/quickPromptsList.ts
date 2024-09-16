import { 
  Book, Compass, Lightbulb, Scale, Puzzle, Globe, Clock, Zap, 
  MessageCircle, Milestone, Umbrella, Heart, Briefcase, TreePine, 
  Microscope, PenTool, Flame, Film, Gitlab, Users, Sparkles, 
  Award, HelpCircle, Wand2, Palette, Coffee, Rocket, Tv2, Handshake, Feather,
  LucideIcon
} from 'lucide-react';

export interface QuickPrompt {
  text: string;
  icon: LucideIcon;
  prompt: string;
}

export const prompts: QuickPrompt[] = [
  { text: "Core Concept", icon: Book, prompt: "What's the most fundamental concept in your field that you think everyone should understand?" },
  { text: "Ethical Dilemma", icon: Scale, prompt: "What's a major ethical challenge or dilemma in your field? How do you approach it?" },
  { text: "Future Impact", icon: Rocket, prompt: "How do you think the topics you cover will shape our world in the next 20 years?" },
  { text: "Misconception", icon: HelpCircle, prompt: "What's the biggest misconception about your field that you'd like to correct?" },
  { text: "Interdisciplinary Connections", icon: Puzzle, prompt: "How does your field intersect with other disciplines in surprising ways?" },
  { text: "Historical Context", icon: Clock, prompt: "How has the historical context shaped the current state of your field?" },
  { text: "Breakthrough Moment", icon: Lightbulb, prompt: "What's a recent breakthrough in your field that excites you the most?" },
  { text: "Global Perspective", icon: Globe, prompt: "How does your topic vary in its application or understanding across different cultures?" },
  { text: "Personal Journey", icon: Compass, prompt: "What personal experiences led you to become passionate about this topic?" },
  { text: "Challenging Consensus", icon: Flame, prompt: "What's a commonly held belief in your field that you think needs to be challenged?" },
  { text: "Practical Application", icon: Briefcase, prompt: "Can you share a real-world example of how your content has been applied practically?" },
  { text: "Future Challenges", icon: Umbrella, prompt: "What do you see as the biggest challenge facing your field in the coming years?" },
  { text: "Inspiration Sources", icon: Feather, prompt: "Who or what are your biggest sources of inspiration in your work?" },
  { text: "Paradigm Shifts", icon: Zap, prompt: "What paradigm shifts have occurred in your field, and how have they changed everything?" },
  { text: "Unintended Consequences", icon: Milestone, prompt: "Can you discuss any unintended consequences (positive or negative) that have emerged from advancements in your field?" },
  { text: "Cross-Cultural Impact", icon: Handshake, prompt: "How does your topic impact or get interpreted differently across various cultures?" },
  { text: "Everyday Relevance", icon: Coffee, prompt: "How can people apply the knowledge from your channel in their everyday lives?" },
  { text: "Artistic Expression", icon: Palette, prompt: "How does your field intersect with or influence art and creative expression?" },
  { text: "Environmental Connections", icon: TreePine, prompt: "How does your topic relate to environmental issues or sustainability?" },
  { text: "Technological Integration", icon: Tv2, prompt: "How is technology changing or advancing your field?" },
  { text: "Human Impact", icon: Heart, prompt: "What's a powerful story of how your work or field has positively impacted someone's life?" },
  { text: "Cutting-Edge Research", icon: Microscope, prompt: "What's the most exciting current research happening in your field?" },
  { text: "Creative Problem-Solving", icon: Wand2, prompt: "Can you share an example of a creative or unconventional solution to a problem in your field?" },
  { text: "Debate Topic", icon: MessageCircle, prompt: "What's a controversial topic in your field that sparks lively debate?" },
  { text: "Seminal Work", icon: Award, prompt: "What book, paper, or work do you consider most influential in your field and why?" },
  { text: "Future Opportunities", icon: Sparkles, prompt: "What emerging opportunities do you see for people interested in your field?" },
  { text: "Collaborative Efforts", icon: Users, prompt: "How has collaboration or teamwork led to significant advancements in your field?" },
  { text: "Methodological Insights", icon: PenTool, prompt: "What methods or approaches in your field do you find most effective or innovative?" },
  { text: "Media Portrayal", icon: Film, prompt: "How accurately is your field portrayed in popular media, and what would you change?" },
  { text: "Open Questions", icon: Gitlab, prompt: "What are some of the biggest unanswered questions in your field?" }
];