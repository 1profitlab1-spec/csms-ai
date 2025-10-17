// components/community/BlueprintCard.tsx
import React, { useState } from 'react';
import { SquadBlueprintPost, User, CommunityAuthor } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icons';
import PostActions from './PostActions';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

interface SquadBlueprintCardProps {
    post: SquadBlueprintPost;
    currentUser: User;
    onToggleLike: (postId: string) => void;
    onAddComment: (postId: string, content: string) => void;
    onStartConversation: (author: CommunityAuthor) => void;
}

const SquadBlueprintCard: React.FC<SquadBlueprintCardProps> = ({ post, currentUser, onToggleLike, onAddComment, onStartConversation }) => {
    const hasLiked = post.likes.includes(currentUser.id);
    const [isCloned, setIsCloned] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleClone = () => {
        localStorage.setItem(`squad_${currentUser.id}`, JSON.stringify(post.squad.agents));
        setIsCloned(true);
        toast.success(`'${post.squad.name}' squad cloned!`);
        setTimeout(() => setIsCloned(false), 2000);
    };

    return (
        <Card>
            <div className="flex items-center gap-3 mb-4">
                <Avatar src={post.author.avatarUrl} fallback={post.author.name.charAt(0)} />
                <div>
                    <p className="font-semibold text-white">{post.author.name}</p>
                    <p className="text-sm text-brand-text-secondary">Shared a Blueprint</p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{post.squad.name}</h3>
            <p className="text-brand-text-secondary mb-4">{post.squad.description}</p>
            
            <div className="mb-4">
                <p className="text-xs font-semibold text-brand-text-secondary mb-2">Agents:</p>
                <div className="flex items-center -space-x-2">
                    {post.squad.agents.map(agent => (
                        <div key={agent.name} className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={agent.name}>
                            <Icon name={agent.icon} className={`w-4 h-4 ${agent.color}`} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-brand-border">
                 <Button variant="outline" className="w-full" onClick={handleClone}>
                    <Icon name={isCloned ? 'check' : 'git-branch'} className="w-4 h-4 mr-2" />
                    {isCloned ? 'Cloned to Roster' : `Clone Squad (${post.clones})`}
                </Button>
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

export default SquadBlueprintCard;