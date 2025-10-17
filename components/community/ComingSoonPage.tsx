// components/community/ComingSoonPage.tsx
import React from 'react';
// FIX: Corrected import for IconName to point to the central types file.
import { Icon } from '../ui/Icons';
import type { IconName } from '../../types';

interface ComingSoonPageProps {
    title: string;
    description: string;
    icon: IconName;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description, icon }) => {
    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-10 bg-transparent animate-fade-in">
            <Icon name={icon} className="w-16 h-16 text-brand-text-secondary mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-brand-text-secondary text-lg max-w-md">
                {description} This feature is under construction.
            </p>
        </div>
    );
};

export default ComingSoonPage;