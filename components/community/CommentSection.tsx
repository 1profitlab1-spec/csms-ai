// components/community/CommentSection.tsx
import React, { useState } from 'react';
import { Comment, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Icon } from '../ui/Icons';

interface CommentSectionProps {
    comments: Comment[];
    currentUser: User;
    onAddComment: (content: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, currentUser, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isPosting) return;

        setIsPosting(true);
        await onAddComment(newComment.trim());
        setNewComment('');
        setIsPosting(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-brand-border">
            <div className="space-y-4 mb-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <Avatar src={comment.author.avatarUrl} fallback={comment.author.name.charAt(0)} className="w-8 h-8"/>
                        <div>
                            <div className="bg-brand-medium rounded-lg px-3 py-2">
                                <p className="text-sm font-semibold text-white">{comment.author.name}</p>
                                <p className="text-sm text-brand-text-primary">{comment.content}</p>
                            </div>
                            <p className="text-xs text-brand-text-secondary mt-1">{new Date(comment.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-center text-brand-text-secondary py-4">No comments yet. Be the first to reply!</p>}
            </div>

            <form onSubmit={handleSubmit} className="flex items-start gap-3">
                 <Avatar src={currentUser.avatarUrl} fallback={currentUser.firstName.charAt(0)} className="w-8 h-8" />
                 <div className="flex-1 relative">
                    <Textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={1}
                        className="pr-12"
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-2 h-8 w-8" disabled={isPosting || !newComment.trim()}>
                        {isPosting ? <Icon name="loader" /> : <Icon name="send" className="w-4 h-4" />}
                    </Button>
                 </div>
            </form>
        </div>
    );
};

export default CommentSection;