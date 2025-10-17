// components/community/MissionShowcaseCard.tsx
import React, { useState } from 'react';
import { MissionShowcasePost, User, CommunityAuthor } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icons';
import PostActions from './PostActions';
import CommentSection from './CommentSection';

interface MissionShowcaseCardProps {
    post: MissionShowcasePost;
    currentUser: User;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onStartConversation: (author: CommunityAuthor) => void;
}

const MissionShowcaseCard: React.FC<MissionShowcaseCardProps> = ({ post, currentUser, onToggleLike, onAddComment, onStartConversation }) => {
    const hasLiked = post.likes.includes(currentUser.id);
    const [showComments, setShowComments] = useState(false);

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <Avatar src={post.author.avatarUrl} fallback={post.author.name.charAt(0)} />
                <div>
                    <p className="font-semibold text-white">{post.author.name}</p>
                    <p className="text-sm text-brand-text-secondary">Showcased a Mission</p>
                </div>
            </div>

            <div className="border-l-4 border-purple-800 pl-4 py-2 bg-purple-950/30 rounded-r-md">
                <h3 className="text-xl font-bold text-white mb-2">{post.mission.missionTitle}</h3>
                <p className="text-brand-text-secondary mb-4">{post.mission.summary}</p>
                
                <div>
                    <p className="text-xs font-semibold text-brand-text-secondary mb-2">Squad Deployed:</p>
                    <div className="flex items-center -space-x-2">
                        {post.mission.squad.map(agent => (
                            <div key={agent.name} className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={agent.name}>
                                <Icon name={agent.icon} className={`w-4 h-4 ${agent.color}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <PostActions
                post={post}
                hasLiked={hasLiked}
                onToggleLike={() => onToggleLike(post.id)}
                onComment={() => setShowComments(!showComments)}
                onStartConversation={onStartConversation}
                author={post.author}
                currentUser={currentUser}
            />

            {showComments && (
                <CommentSection
                    comments={post.comments}
                    currentUser={currentUser}
                    onAddComment={(content) => onAddComment(post.id, content)}
                />
            )}
        </Card>
    );
};

export default MissionShowcaseCard;