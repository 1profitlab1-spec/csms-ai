// components/document/ShareInsightModal.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { createPost } from '../../services/communityService';
import toast from 'react-hot-toast';

interface ShareInsightModalProps {
  user: User;
  insight: string;
  onClose: () => void;
}

const ShareInsightModal: React.FC<ShareInsightModalProps> = ({ user, insight, onClose }) => {
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fullPostContent = `> ${insight}\n\n${comment}`;

    const handlePost = async () => {
        setIsLoading(true);
        try {
            await createPost({id: user.id, name: user.name, avatarUrl: user.avatarUrl}, fullPostContent);
            toast.success("Insight shared to the Nexus!");
            onClose();
        } catch (error) {
            toast.error("Failed to share insight.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="glassmorphism w-full max-w-lg rounded-xl p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Share Insight</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><Icon name="x"/></Button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-brand-text-secondary">You are about to share the following agent insight to the community Nexus:</p>
                    <blockquote className="border-l-4 border-purple-700 pl-4 py-2 bg-purple-950/40 text-purple-200 italic">
                        {insight}
                    </blockquote>
                    <Textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add your comment or context (optional)..."
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handlePost} disabled={isLoading}>
                        {isLoading ? <Icon name="loader" /> : 'Post to Nexus'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShareInsightModal;
