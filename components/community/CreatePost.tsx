// components/community/CreatePost.tsx
import React, { useState } from 'react';
import { User, UserPost, CommunityAuthor } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icons';
import { createPost } from '../../services/communityService';

interface CreatePostProps {
    user: User;
    onCreatePost: (post: UserPost) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ user, onCreatePost }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        setIsLoading(true);
        const author: CommunityAuthor = {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
        };

        try {
            const newPost = await createPost(author, content);
            onCreatePost(newPost);
            setContent('');
        } catch (error) {
            console.error("Failed to create post", error);
            // Here you could add a toast notification for the error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mb-8 p-4">
            <div className="flex items-start gap-4">
                <Avatar src={user.avatarUrl} fallback={user.firstName.charAt(0)} />
                <form onSubmit={handleSubmit} className="flex-1">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts or start a new discussion..."
                        className="bg-brand-dark/50 border-brand-border focus:bg-brand-dark"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="flex justify-end items-center mt-3">
                        {/* Placeholder for future features like image upload */}
                        <div className="flex-1"></div>
                        <Button type="submit" disabled={isLoading || !content.trim()}>
                            {isLoading ? <Icon name="loader" className="w-5 h-5" /> : "Post"}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

export default CreatePost;