// components/community/NexusFeed.tsx
import React from 'react';
import { User, FeedItem, CommunityAuthor } from '../../types';
import CreatePost from './CreatePost';
import { AnimatedSection } from '../ui/AnimatedSection';
import UserPostCard from './UserPostCard';
import DiscussionPostCard from './DiscussionPostCard';
import MissionShowcaseCard from './MissionShowcaseCard';
import SquadBlueprintCard from './BlueprintCard';
import OraclePulseCard from './OraclePulseCard';

interface NexusFeedProps {
    user: User;
    feed: FeedItem[];
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onStartConversation: (author: CommunityAuthor) => void;
}

const NexusFeed: React.FC<NexusFeedProps> = ({ user, feed, onToggleLike, onAddComment, onStartConversation }) => {
    
    const renderFeedItem = (item: FeedItem) => {
        switch(item.type) {
            case 'user_post':
                return <UserPostCard key={item.id} post={item} currentUser={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onStartConversation={onStartConversation} />;
            case 'discussion_post':
                return <DiscussionPostCard key={item.id} post={item} currentUser={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onStartConversation={onStartConversation} />;
            case 'mission_showcase':
                return <MissionShowcaseCard key={item.id} post={item} currentUser={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onStartConversation={onStartConversation} />;
            case 'squad_blueprint':
                return <SquadBlueprintCard key={item.id} post={item} currentUser={user} onToggleLike={onToggleLike} onAddComment={onAddComment} onStartConversation={onStartConversation} />;
            case 'oracle_pulse':
                return <OraclePulseCard key={item.id} post={item} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <AnimatedSection>
                    <CreatePost user={user} onCreatePost={() => { /* In a real app, this would refresh the feed */ }} />
                </AnimatedSection>

                <div className="space-y-6">
                    {feed.map((item, index) => (
                        <AnimatedSection key={item.id} style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                           {renderFeedItem(item)}
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NexusFeed;