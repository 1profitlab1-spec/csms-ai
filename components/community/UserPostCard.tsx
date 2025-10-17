// components/community/UserPostCard.tsx
import React, { useMemo, useState } from 'react';
import { UserPost, User, CommunityAuthor } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import PostActions from './PostActions';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import CommentSection from './CommentSection';

interface UserPostCardProps {
    post: UserPost;
    currentUser: User;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onStartConversation: (author: CommunityAuthor) => void;
}

const UserPostCard: React.FC<UserPostCardProps> = ({ post, currentUser, onToggleLike, onAddComment, onStartConversation }) => {
    const hasLiked = post.likes.includes(currentUser.id);
    const [showComments, setShowComments] = useState(false);

    const cleanHtml = useMemo(() => {
        const dirty = marked.parse(post.content, { breaks: true });
        return DOMPurify.sanitize(dirty);
    }, [post.content]);

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <Avatar src={post.author.avatarUrl} fallback={post.author.name.charAt(0)} />
                <div>
                    <p className="font-semibold text-white">{post.author.name}</p>
                    <p className="text-sm text-brand-text-secondary">
                        {new Date(post.timestamp).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="prose prose-sm prose-invert max-w-none prose-p:text-brand-text-primary"
                 dangerouslySetInnerHTML={{ __html: cleanHtml }} />

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

export default UserPostCard;