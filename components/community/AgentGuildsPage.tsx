// components/community/AgentGuildsPage.tsx
import React, { useState } from 'react';
import { User, AgentLeaderboardStats, NominatedAgent } from '../../types';
import { Icon } from '../ui/Icons';
import { AnimatedSection } from '../ui/AnimatedSection';
import AgentLeaderboard from './AgentLeaderboard';
import AgentFoundry from './AgentFoundry';

type GuildsTab = 'leaderboards' | 'foundry';

interface AgentGuildsPageProps {
    user: User;
    stats: AgentLeaderboardStats[];
    nominatedAgents: NominatedAgent[];
    onVote: (agentId: string) => void;
}

const AgentGuildsPage: React.FC<AgentGuildsPageProps> = ({ user, stats, nominatedAgents, onVote }) => {
    const [activeTab, setActiveTab] = useState<GuildsTab>('leaderboards');

    return (
        <div className="p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                    <div className="flex items-center gap-4 mb-8">
                        <Icon name="shield" className="w-10 h-10 text-purple-400" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">Agent Guilds</h1>
                            <p className="text-brand-text-secondary mt-1 text-lg">Celebrate top agents and shape the future of the agent roster.</p>
                        </div>
                    </div>
                </AnimatedSection>

                <div className="flex items-center gap-2 border-b border-brand-border mb-8">
                    <TabButton label="Agent Leaderboards" isActive={activeTab === 'leaderboards'} onClick={() => setActiveTab('leaderboards')} />
                    <TabButton label="The Agent Foundry" isActive={activeTab === 'foundry'} onClick={() => setActiveTab('foundry')} />
                </div>

                {activeTab === 'leaderboards' && <AgentLeaderboard stats={stats} />}
                {activeTab === 'foundry' && <AgentFoundry user={user} nominatedAgents={nominatedAgents} onVote={onVote} />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? 'border-purple-500 text-white'
        : 'border-transparent text-brand-text-secondary hover:text-white'
    }`}
  >
    {label}
  </button>
);

export default AgentGuildsPage;
