// components/community/HubsPage.tsx
import React, { useState, useMemo } from 'react';
import { Hub, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { AnimatedSection } from '../ui/AnimatedSection';
import HubCard from './HubCard';

interface HubsPageProps {
    user: User;
    hubs: Hub[];
    onSelectHub: (hubId: string) => void;
    onToggleMembership: (hubId: string) => void;
}

const HubsPage: React.FC<HubsPageProps> = ({ user, hubs, onSelectHub, onToggleMembership }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const { myHubs, allHubs } = useMemo(() => {
        const filtered = hubs.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const my = filtered.filter(h => h.members.some(m => m.id === user.id));
        const all = filtered.filter(h => !h.members.some(m => m.id === user.id));
        return { myHubs: my, allHubs: all };
    }, [hubs, searchTerm, user.id]);

    return (
        <div className="p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                    <div className="flex items-center gap-4 mb-4">
                        <Icon name="users" className="w-10 h-10 text-purple-400" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">Hubs</h1>
                            <p className="text-brand-text-secondary mt-1 text-lg">Join communities to collaborate and discuss specific topics.</p>
                        </div>
                    </div>
                    <div className="relative mt-6 mb-8">
                        <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                        <Input
                            placeholder="Search for Hubs..."
                            className="pl-11 h-12 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </AnimatedSection>

                <AnimatedSection style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-bold text-white mb-4">My Hubs</h2>
                    {myHubs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myHubs.map(hub => <HubCard key={hub.id} hub={hub} onSelectHub={onSelectHub} />)}
                        </div>
                    ) : (
                        <p className="text-brand-text-secondary">You haven't joined any hubs yet.</p>
                    )}
                </AnimatedSection>

                 <AnimatedSection className="mt-10" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-bold text-white mb-4">Discover Hubs</h2>
                    {allHubs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {allHubs.map(hub => <HubCard key={hub.id} hub={hub} onSelectHub={onSelectHub} />)}
                        </div>
                    ) : (
                         <p className="text-brand-text-secondary">No other hubs to discover.</p>
                    )}
                </AnimatedSection>
            </div>
        </div>
    );
};

export default HubsPage;
