// components/community/MyHubProfilePage.tsx
import React from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icons';

interface MyHubProfilePageProps {
    user: User;
}

const MyHubProfilePage: React.FC<MyHubProfilePageProps> = ({ user }) => {
    return (
        <div className="p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <Card className="p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar src={user.avatarUrl} fallback={user.firstName.charAt(0)} className="w-24 h-24 text-4xl" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                            <p className="text-lg text-brand-text-secondary">{user.jobRole || 'Cosmos Member'}</p>
                        </div>
                    </div>
                </Card>
                
                <h2 className="text-2xl font-bold text-white mb-4">My Contributions</h2>
                <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-lg">
                    <Icon name="sparkles" className="w-12 h-12 mx-auto text-brand-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-white">Showcase Your Work</h3>
                    <p className="text-brand-text-secondary mt-1">
                        Your published Mission Showcases and Squad Blueprints will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyHubProfilePage;