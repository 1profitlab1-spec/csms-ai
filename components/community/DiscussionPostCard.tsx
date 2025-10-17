// components/community/DiscussionPostCard.tsx
import React, { useState } from 'react';
import { DiscussionPost, User, CommunityAuthor } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icons';
import PostActions from './PostActions';
import CommentSection from './CommentSection';

interface DiscussionPostCardProps {
    post: DiscussionPost;
    currentUser: User;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onStartConversation: (author: CommunityAuthor) => void;
}

const DiscussionPostCard: React.FC<DiscussionPostCardProps> = ({ post, currentUser, onToggleLike, onAddComment, onStartConversation }) => {
    const hasLiked = post.likes.includes(currentUser.id);
    const [showComments, setShowComments] = useState(false);

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <Avatar src={post.author.avatarUrl} fallback={post.author.name.charAt(0)} />
                <div>
                    <p className="font-semibold text-white">{post.author.name}</p>
                    <p className="text-sm text-brand-text-secondary">Started a discussion</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <Icon name={post.icon} className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-white">{post.title}</h3>
                    <p className="text-brand-text-secondary mt-1">{post.content}</p>
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

export default DiscussionPostCard;