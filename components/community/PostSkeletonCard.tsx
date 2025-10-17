// components/community/PostSkeletonCard.tsx
import React from 'react';
import { Card } from '../ui/Card';

const PostSkeletonCard: React.FC = () => {
    return (
        <Card className="animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-medium" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-brand-medium rounded w-1/2"></div>
                    <div className="h-3 bg-brand-medium rounded w-1/4"></div>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="h-5 bg-brand-medium rounded w-3/4"></div>
                <div className="h-4 bg-brand-medium rounded w-full"></div>
                <div className="h-4 bg-brand-medium rounded w-5/6"></div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                <div className="h-4 bg-brand-medium rounded w-1/4"></div>
                <div className="h-8 bg-brand-medium rounded w-1/3"></div>
            </div>
        </Card>
    );
};

export default PostSkeletonCard;