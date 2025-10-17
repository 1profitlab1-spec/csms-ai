import React, { useState, useMemo } from 'react';
import { AgentAnalytic, Agent, WorkspaceView } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { ALL_AGENTS_POOL } from '../../constants';
// FIX: Import the 'Button' component to resolve 'Cannot find name' errors.
import { Button } from '../ui/Button';

interface AgentConstellationProps {
    analytics: AgentAnalytic[];
    allAgents: Agent[];
    onViewChange: (view: WorkspaceView) => void;
}

const AgentConstellation: React.FC<AgentConstellationProps> = ({ analytics, allAgents, onViewChange }) => {
    const [selectedAgent, setSelectedAgent] = useState<AgentAnalytic | null>(null);

    const nodes = useMemo(() => {
        if (analytics.length === 0) return [];
        const maxUsage = Math.max(...analytics.map(a => a.usage), 1);
        const angleStep = (2 * Math.PI) / analytics.length;
        const radius = Math.min(200, 30 * analytics.length);

        return analytics.map((agent, i) => {
            const size = 20 + (agent.usage / maxUsage) * 30; // Star size
            const brightness = 0.5 + (agent.usage / maxUsage) * 0.5; // Star brightness
            return {
                ...agent,
                x: 250 + radius * Math.cos(angleStep * i),
                y: 250 + radius * Math.sin(angleStep * i),
                size,
                brightness,
                icon: allAgents.find(a => a.name === agent.name)?.icon || 'bot'
            };
        });
    }, [analytics, allAgents]);

    const links = useMemo(() => {
        const uniqueLinks = new Set<string>();
        const maxSynergy = Math.max(...analytics.flatMap(a => a.synergies.map(s => s.count)), 1);
        
        const generatedLinks: any[] = [];
        nodes.forEach(nodeA => {
            nodeA.synergies.forEach(synergy => {
                const nodeB = nodes.find(n => n.name === synergy.with);
                if (!nodeB) return;
                
                const key = [nodeA.name, nodeB.name].sort().join('-');
                if (uniqueLinks.has(key)) return;

                uniqueLinks.add(key);
                generatedLinks.push({
                    source: nodeA,
                    target: nodeB,
                    strokeWidth: 1 + (synergy.count / maxSynergy) * 4,
                    opacity: 0.2 + (synergy.count / maxSynergy) * 0.6
                });
            });
        });
        return generatedLinks;
    }, [nodes]);

    const getAgentDetails = (name: string) => ALL_AGENTS_POOL.find(a => a.name === name);

    const handleFindBlueprints = (agentA: string, agentB: string) => {
        const filter = { agents: [agentA, agentB] };
        sessionStorage.setItem('cosmos_blueprint_filter', JSON.stringify(filter));
        onViewChange('community');
    };

    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
                Agent Performance Constellation
            </h3>
            <p className="text-sm text-brand-text-secondary mb-4">Click on an agent to see their performance analysis.</p>
            <div className="relative w-full h-[500px]">
                <svg viewBox="0 0 500 500" width="100%" height="100%">
                    <defs>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                        </filter>
                    </defs>
                    {/* Render links */}
                    {links.map((link, i) => (
                        <line
                            key={i}
                            x1={link.source.x} y1={link.source.y}
                            x2={link.target.x} y2={link.target.y}
                            stroke="rgba(192, 132, 252, 0.5)"
                            strokeWidth={link.strokeWidth}
                            opacity={link.opacity}
                        />
                    ))}
                    {/* Render nodes */}
                    {nodes.map(node => (
                        <g key={node.name} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer" onClick={() => setSelectedAgent(node)}>
                            <circle
                                r={node.size / 2}
                                fill="rgba(192, 132, 252, 0.7)"
                                filter="url(#glow)"
                                style={{ opacity: node.brightness, transition: 'all 0.3s' }}
                            />
                            <foreignObject x={-node.size / 2} y={-node.size / 2} width={node.size} height={node.size}>
                                 <div className="flex items-center justify-center w-full h-full text-white">
                                    <Icon name={node.icon} style={{ width: `${node.size * 0.5}px`, height: `${node.size * 0.5}px` }} />
                                </div>
                            </foreignObject>
                             <text y={node.size / 2 + 15} textAnchor="middle" fill="white" fontSize="12" className="font-semibold">{node.name}</text>
                        </g>
                    ))}
                </svg>
            </div>
            
            {selectedAgent && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelectedAgent(null)}>
                    <Card className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Oracle's Analysis: {selectedAgent.name}</h2>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedAgent(null)}><Icon name="x"/></Button>
                        </div>
                        <p className="text-brand-text-secondary text-sm mt-1">{getAgentDetails(selectedAgent.name)?.role}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-brand-dark p-3 rounded-lg">
                                <p className="text-sm text-brand-text-secondary">Mission Deployments</p>
                                <p className="text-2xl font-bold">{selectedAgent.usage}</p>
                            </div>
                             <div className="bg-brand-dark p-3 rounded-lg">
                                <p className="text-sm text-brand-text-secondary">Success Contribution</p>
                                <p className="text-2xl font-bold">{(selectedAgent.brightness * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                        <div className="mt-4">
                             <h3 className="font-semibold mb-2">Top Synergies:</h3>
                             <ul className="space-y-2">
                                {selectedAgent.synergies.slice(0, 3).map(synergy => (
                                    <li key={synergy.with} className="flex items-center gap-2 text-sm p-2 bg-brand-dark rounded-md">
                                        <Icon name={getAgentDetails(synergy.with)?.icon || 'bot'} className="w-5 h-5 text-purple-400" />
                                        <span>{synergy.with}</span>
                                        <span className="ml-auto text-brand-text-secondary">{synergy.count} collabs</span>
                                        <Button size="sm" variant="ghost" onClick={() => handleFindBlueprints(selectedAgent.name, synergy.with)}>
                                            Find Blueprints
                                        </Button>
                                    </li>
                                ))}
                                {selectedAgent.synergies.length === 0 && <p className="text-sm text-brand-text-secondary">No significant synergies yet.</p>}
                             </ul>
                        </div>
                    </Card>
                </div>
            )}
        </Card>
    );
};

export default AgentConstellation;