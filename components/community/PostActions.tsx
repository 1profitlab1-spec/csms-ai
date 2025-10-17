// components/community/PostActions.tsx
import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icons';
import { FeedItem, CommunityAuthor, User } from '../../types';
import toast from 'react-hot-toast';

interface PostActionsProps {
    post: FeedItem;
    hasLiked: boolean;
    onToggleLike: (postId: string) => void;
    onComment: () => void;
    onStartConversation: (author: CommunityAuthor) => void;
    author: CommunityAuthor;
    currentUser: User;
}

const PostActions: React.FC<PostActionsProps> = ({ post, hasLiked, onToggleLike, onComment, onStartConversation, author, currentUser }) => {
    
    const handleShare = async () => {
        const shareData = {
            title: `Check out this post on Cosmos`,
            text: `Found something interesting in the Cosmos AI community!`,
            url: window.location.href, // Placeholder URL for MVP
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareData.url);
            toast.success('Link copied to clipboard!');
        }
    };
    
    // Type guard to check if post is likeable
    const isLikeable = (p: FeedItem): p is (FeedItem & { likes: string[] }) => 'likes' in p;
    // Type guard to check if post is commentable
    const isCommentable = (p: FeedItem): p is (FeedItem & { comments: any[] }) => 'comments' in p;

    return (
        <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-brand-text-secondary">
                {isLikeable(post) && (
                    <Button variant="ghost" size="sm" onClick={() => onToggleLike(post.id)} className={`flex items-center gap-2 ${hasLiked ? 'text-purple-400' : ''}`}>
                        <Icon name="heart" className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes.length} Likes</span>
                    </Button>
                )}
                {isCommentable(post) && (
                    <Button variant="ghost" size="sm" onClick={onComment} className="flex items-center gap-2">
                        <Icon name="message-circle" className="w-4 h-4" />
                        <span>{post.comments.length} Comments</span>
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2">
                {author.id !== currentUser.id && (
                     <Button variant="ghost" size="sm" onClick={() => onStartConversation(author)}>
                        <Icon name="mail" className="w-4 h-4 mr-2" />
                        Message
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="text-brand-text-secondary" onClick={handleShare}>
                    <Icon name="share-2" className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default PostActions;