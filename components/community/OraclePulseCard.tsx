// components/community/OraclePulseCard.tsx
import React from 'react';
import { OraclePulsePost } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';

interface OraclePulseCardProps {
    post: OraclePulsePost;
}

const OraclePulseCard: React.FC<OraclePulseCardProps> = ({ post }) => {
    return (
        <Card className="bg-purple-950/40 border-purple-800">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900/50 flex-shrink-0">
                    <Icon name={post.icon} className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                    <p className="font-semibold text-purple-300">Oracle Pulse</p>
                    <h3 className="text-lg font-bold text-white mt-1">{post.title}</h3>
                    <p className="text-brand-text-secondary mt-2">{post.content}</p>
                </div>
            </div>
        </Card>
    );
};

export default OraclePulseCard;
