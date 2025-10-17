// components/community/AgentLeaderboard.tsx
import React, { useMemo } from 'react';
import { AgentLeaderboardStats } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { ALL_AGENTS_POOL } from '../../constants';
import { Progress } from '../ui/Progress';

interface AgentLeaderboardProps {
    stats: AgentLeaderboardStats[];
}

const AgentLeaderboard: React.FC<AgentLeaderboardProps> = ({ stats }) => {
    const topDeployed = useMemo(() => {
        return [...stats].sort((a, b) => b.deployments - a.deployments).slice(0, 5);
    }, [stats]);

    const topSuccess = useMemo(() => {
        return [...stats].sort((a, b) => b.successContributions - a.successContributions).slice(0, 5);
    }, [stats]);
    
    const getAgentIcon = (name: string) => ALL_AGENTS_POOL.find(a => a.name === name)?.icon || 'bot';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Icon name="trending-up" className="w-6 h-6 text-purple-400" />
                    Most Deployed Agents
                </h2>
                <ul className="space-y-4">
                    {topDeployed.map(agent => (
                        <li key={agent.agentName} className="flex items-center gap-4">
                            <Icon name={getAgentIcon(agent.agentName)} className="w-8 h-8 text-purple-300 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold">{agent.agentName}</p>
                                <p className="text-sm text-brand-text-secondary">{agent.deployments} missions</p>
                            </div>
                        </li>
                    ))}
                    {topDeployed.length === 0 && <p className="text-brand-text-secondary text-sm">No deployment data yet.</p>}
                </ul>
            </Card>
             <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Icon name="crown" className="w-6 h-6 text-purple-400" />
                    Highest Success Contribution
                </h2>
                 <ul className="space-y-4">
                    {topSuccess.map(agent => (
                        <li key={agent.agentName}>
                            <div className="flex items-center gap-4 mb-1">
                                <Icon name={getAgentIcon(agent.agentName)} className="w-8 h-8 text-purple-300 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold">{agent.agentName}</p>
                                </div>
                                <span className="font-bold text-purple-300">{agent.successContributions}%</span>
                            </div>
                            <Progress value={agent.successContributions} />
                        </li>
                    ))}
                     {topSuccess.length === 0 && <p className="text-brand-text-secondary text-sm">No success data yet.</p>}
                </ul>
            </Card>
        </div>
    );
};

export default AgentLeaderboard;
