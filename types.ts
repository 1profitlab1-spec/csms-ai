// types.ts

export type IconName = 
  | 'bot' | 'users' | 'bar-chart-2' | 'dollar-sign' | 'sparkles' | 'video' 
  | 'target' | 'trending-up' | 'image' | 'message-square' | 'line-chart' 
  | 'compass' | 'pen-tool' | 'flask-round' | 'leaf' | 'flask-conical' 
  | 'building' | 'book-open' | 'code' | 'microscope' | 'globe' | 'loader' 
  | 'plus' | 'chevron-down' | 'message-circle' | 'settings' | 'log-out' 
  | 'home' | 'search' | 'menu' | 'x' | 'check' | 'lightbulb' | 'brain-circuit'
  | 'user' | 'shield' | 'git-branch' | 'mail' | 'chevron-left' | 'send'
  | 'heart' | 'share-2' | 'arrow-up' | 'crown' | 'hammer';

export interface Agent {
  name: string;
  role: string;
  icon: IconName;
  color: string;
  personality: string;
}

export interface SquadPreset {
  name: string;
  description: string;
  agents: Agent[];
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  email: string;
  isNewUser?: boolean;
  avatarUrl?: string;
  jobRole?: string;
}

export interface Section {
  id: string;
  content: string;
}

export interface HuddleMessage {
  id: string;
  type: 'user' | 'agent';
  text: string;
  timestamp: string;
  isLoading?: boolean;
  visualCode?: string;
  visualType?: 'mermaid' | 'image';
}

export interface Mission {
  id: string;
  title: string;
  details: string;
  jobRole: string;
  agents: Agent[];
  document: Section[];
  huddleMessages: HuddleMessage[];
  hubId?: string;
}

export interface OracleInsight {
  summary: string;
  suggestion: {
    title: string;
    details: string;
    jobRole: string;
    justification: string;
  };
}

export interface CommunityAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  jobRole?: string;
}

export interface Comment {
    id: string;
    author: CommunityAuthor;
    content: string;
    timestamp: string;
}

export interface DiscussionPost {
  type: 'discussion_post';
  id: string;
  author: CommunityAuthor;
  title: string;
  content: string;
  icon: IconName;
  likes: string[]; // user IDs
  comments: Comment[];
  timestamp: string;
}

export interface AgentLeaderboardStats {
  agentName: string;
  deployments: number;
  successContributions: number;
}

export type WorkspaceView = 'dashboard' | 'chats' | 'agents' | 'analytics' | 'community' | 'settings' | 'mission';

export interface AgentResponse {
  agent: Agent;
  content: string;
}

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export type CommunityView = 'nexus' | 'profile' | 'hubs' | 'guilds' | 'blueprints' | 'messages';

export interface SquadBlueprintPost {
  type: 'squad_blueprint';
  id: string;
  author: CommunityAuthor;
  squad: {
    name: string;
    description: string;
    agents: Agent[];
  };
  likes: string[];
  comments: Comment[];
  clones: number;
  timestamp: string;
}

export interface MissionShowcasePost {
  type: 'mission_showcase';
  id: string;
  author: CommunityAuthor;
  mission: {
    missionTitle: string;
    summary: string;
    squad: Agent[];
  };
  likes: string[];
  comments: Comment[];
  timestamp: string;
}

export interface OraclePulsePost {
  type: 'oracle_pulse';
  id: string;
  title: string;
  content: string;
  icon: IconName;
  timestamp: string;
}

export interface UserPost {
  type: 'user_post';
  id: string;
  author: CommunityAuthor;
  content: string;
  likes: string[];
  comments: Comment[];
  timestamp: string;
}

export type FeedItem = UserPost | DiscussionPost | MissionShowcasePost | SquadBlueprintPost | OraclePulsePost;

export interface Hub {
  id: string;
  name: string;
  description: string;
  members: CommunityAuthor[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: CommunityAuthor[];
  messages: Message[];
}

export interface AgentAnalytic {
  name: string;
  usage: number;
  synergies: { with: string; count: number }[];
}

export interface NominatedAgent {
  id: string;
  agent: Agent;
  reason: string;
  nominatedBy: CommunityAuthor;
  votes: string[]; // array of user IDs
}

export interface SynergyReport {
    cohesion: 'High' | 'Medium' | 'Low';
    summary: string;
    connections: { agentA: string; agentB: string; strength: number }[];
}

export interface CommunityDb {
    feed: FeedItem[];
    hubs: Hub[];
    conversations: Conversation[];
    agentStats: AgentLeaderboardStats[];
    nominatedAgents: NominatedAgent[];
}