// services/communityService.ts
import { 
    CommunityDb, UserPost, MissionShowcasePost, SquadBlueprintPost, DiscussionPost, OraclePulsePost,
    User, CommunityAuthor, Mission, FeedItem, Hub, Conversation, Message, NominatedAgent, AgentLeaderboardStats, Comment 
} from '../types';
import { ALL_AGENTS_POOL, DEFAULT_AGENTS } from '../constants';

const DB_KEY = 'cosmos_community_db';

const MOCK_AUTHORS: CommunityAuthor[] = [
    { id: 'author-1', name: 'Alex Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=alex', jobRole: 'Growth Marketer' },
    { id: 'author-2', name: 'Brenda Smith', avatarUrl: 'https://i.pravatar.cc/150?u=brenda', jobRole: 'SEO Specialist' },
    { id: 'author-3', name: 'Charles White', avatarUrl: 'https://i.pravatar.cc/150?u=charles', jobRole: 'Startup Founder' },
];

const getInitialDb = (): CommunityDb => ({
    feed: [
        {
            type: 'mission_showcase',
            id: 'showcase-1',
            author: MOCK_AUTHORS[0],
            mission: {
                missionTitle: 'Eco-Friendly Packaging Launch Strategy',
                summary: 'Leveraged a content-focused squad to develop and execute a multi-platform marketing strategy, resulting in a 40% increase in pre-orders for our new product line.',
                squad: ALL_AGENTS_POOL.filter(a => ['Kairo', 'Voxis', 'Stratos'].includes(a.name)),
            },
            likes: ['author-2', 'author-3'],
            comments: [
                { id: 'c1-1', author: MOCK_AUTHORS[2], content: 'Impressive results! How did you measure pre-order lift?', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { id: 'c1-2', author: MOCK_AUTHORS[0], content: 'Thanks! We used unique UTMs for each platform and compared against baseline projections.', timestamp: new Date(Date.now() - 3000000).toISOString() },
            ],
            timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            type: 'discussion_post',
            id: 'discussion-1',
            author: MOCK_AUTHORS[1],
            title: 'Which agent is most underrated for technical SEO analysis?',
            content: "I've had surprising success with Zephyr for keyword clustering, but I'm curious if anyone has found a better combination of agents for deep-dive SEO tasks.",
            icon: 'brain-circuit',
            likes: ['author-1'],
            comments: [],
            timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
         {
            type: 'squad_blueprint',
            id: 'blueprint-1',
            author: MOCK_AUTHORS[2],
            squad: {
                name: "Rapid Growth Hacking Unit",
                description: "A lean, aggressive squad designed for quick A/B testing, viral content creation, and conversion optimization. Perfect for early-stage startups.",
                agents: ALL_AGENTS_POOL.filter(a => ['Voxis', 'Convertor', 'ClipBot'].includes(a.name))
            },
            likes: ['author-1', 'author-2'],
            comments: [],
            clones: 25,
            timestamp: new Date(Date.now() - 259200000).toISOString(),
        }
    ],
    hubs: [
        { id: 'hub-1', name: 'Marketing Mavericks', description: 'A community for marketers to share strategies, tools, and success stories.', members: [MOCK_AUTHORS[0], MOCK_AUTHORS[1]] },
        { id: 'hub-2', name: 'Startup Founders', description: 'Connect with fellow entrepreneurs to navigate the challenges of building a business.', members: [MOCK_AUTHORS[2]] },
    ],
    conversations: [],
    agentStats: DEFAULT_AGENTS.map(a => ({ agentName: a.name, deployments: Math.floor(Math.random() * 50), successContributions: Math.floor(Math.random() * 40) + 50 })),
    nominatedAgents: [],
});

const getDb = (): CommunityDb => {
    const dbJson = localStorage.getItem(DB_KEY);
    if (!dbJson) {
        const initialDb = getInitialDb();
        localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
        return initialDb;
    }
    return JSON.parse(dbJson);
};

const saveDb = (db: CommunityDb) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- API Functions ---

export const fetchCommunityFeed = async (userId: string): Promise<CommunityDb> => {
    return Promise.resolve(getDb());
};

export const createPost = async (author: CommunityAuthor, content: string): Promise<UserPost> => {
    const db = getDb();
    const newPost: UserPost = {
        type: 'user_post',
        id: `post-${Date.now()}`,
        author,
        content,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
    };
    db.feed.unshift(newPost);
    saveDb(db);
    return Promise.resolve(newPost);
};

export const createMissionShowcasePost = async (author: CommunityAuthor, mission: MissionShowcasePost['mission']): Promise<MissionShowcasePost> => {
    const db = getDb();
    const newPost: MissionShowcasePost = {
        type: 'mission_showcase',
        id: `showcase-${Date.now()}`,
        author,
        mission,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
    };
    db.feed.unshift(newPost);
    saveDb(db);
    return Promise.resolve(newPost);
};

export const createComment = async (postId: string, author: CommunityAuthor, content: string): Promise<CommunityDb> => {
    const db = getDb();
    const post = db.feed.find(p => p.id === postId);

    if (post && 'comments' in post) {
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            author,
            content,
            timestamp: new Date().toISOString(),
        };
        post.comments.push(newComment);
        saveDb(db);
    }
    return Promise.resolve(db);
};

export const fetchBlueprints = async (): Promise<SquadBlueprintPost[]> => {
    const db = getDb();
    return Promise.resolve(db.feed.filter(item => item.type === 'squad_blueprint') as SquadBlueprintPost[]);
};


export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
    const db = getDb();
    return Promise.resolve(db.conversations.filter(c => c.participants.some(p => p.id === userId)));
};

export const sendMessage = async (conversationId: string, senderId: string, text: string): Promise<CommunityDb> => {
    const db = getDb();
    const convo = db.conversations.find(c => c.id === conversationId);
    if (convo) {
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId,
            text,
            timestamp: new Date().toISOString(),
        };
        convo.messages.push(newMessage);
        saveDb(db);
    }
    return Promise.resolve(db);
};

export const togglePostLike = async (postId: string, userId: string): Promise<CommunityDb> => {
    const db = getDb();
    const post = db.feed.find(p => p.id === postId);
    if (post && 'likes' in post) {
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }
        saveDb(db);
    }
    return Promise.resolve(db);
};