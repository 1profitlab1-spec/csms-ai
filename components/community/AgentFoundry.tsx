// components/community/AgentFoundry.tsx
import React from 'react';
import { NominatedAgent, User } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface AgentFoundryProps {
    user: User;
    nominatedAgents: NominatedAgent[];
    onVote: (agentId: string) => void;
}

const AgentFoundry: React.FC<AgentFoundryProps> = ({ user, nominatedAgents, onVote }) => {
    return (
        <div>
            <Card className="bg-purple-950/40 border-purple-800 p-6 mb-8">
                <div className="flex items-center gap-4">
                    <Icon name="hammer" className="w-8 h-8 text-purple-300" />
                    <div>
                        <h2 className="text-xl font-bold text-white">The Agent Foundry</h2>
                        <p className="text-brand-text-secondary">Upvote community-nominated agents to promote them to the official roster.</p>
                    </div>
                </div>
            </Card>

            {nominatedAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nominatedAgents.map(nominated => {
                        const hasVoted = nominated.votes.includes(user.id);
                        return (
                            <Card key={nominated.id} className="flex flex-col">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-purple-900/50`}>
                                        <Icon name={nominated.agent.icon} className={`w-7 h-7 ${nominated.agent.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-white">{nominated.agent.name}</h2>
                                        <p className="text-sm text-purple-300">{nominated.agent.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-brand-text-secondary flex-grow mb-4">{nominated.reason}</p>
                                <div className="text-xs text-brand-text-secondary mb-4">
                                    Nominated by <span className="font-semibold text-white">{nominated.nominatedBy.name}</span>
                                </div>
                                <Button
                                    variant={hasVoted ? 'default' : 'outline'}
                                    onClick={() => onVote(nominated.id)}
                                    className="w-full mt-auto"
                                >
                                    <Icon name="arrow-up" className="w-4 h-4 mr-2" />
                                    {hasVoted ? 'Upvoted' : 'Upvote'} ({nominated.votes.length})
                                </Button>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-lg">
                    <Icon name="shield" className="w-12 h-12 mx-auto text-brand-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-white">The Foundry is Quiet</h3>
                    <p className="text-brand-text-secondary mt-1">
                        No new agents have been nominated yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgentFoundry;
