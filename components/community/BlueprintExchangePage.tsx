// components/community/BlueprintExchangePage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { SquadBlueprintPost, User, CommunityAuthor } from '../../types';
import { fetchBlueprints } from '../../services/communityService';
import { Icon } from '../ui/Icons';
import { Input } from '../ui/Input';
import { AnimatedSection } from '../ui/AnimatedSection';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
// FIX: Import the 'Badge' component to resolve 'Cannot find name' errors.
import { Badge } from '../ui/Badge';

interface BlueprintExchangeCardProps {
    post: SquadBlueprintPost;
    user: User;
    onStartConversation: (author: CommunityAuthor) => void;
}

const BlueprintExchangeCard: React.FC<BlueprintExchangeCardProps> = ({ post, user, onStartConversation }) => {
    const [isCloned, setIsCloned] = useState(false);

    const handleClone = () => {
        try {
            localStorage.setItem(`squad_${user.id}`, JSON.stringify(post.squad.agents));
            setIsCloned(true);
            toast.success(`'${post.squad.name}' cloned to your Active Roster!`);
            setTimeout(() => setIsCloned(false), 2000);
        } catch (error) {
            toast.error('Failed to clone blueprint.');
            console.error("Clone error:", error);
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <Avatar src={post.author.avatarUrl} fallback={post.author.name.charAt(0)} className="w-9 h-9" />
                <div>
                    <p className="font-semibold text-sm text-white">{post.author.name}</p>
                    <p className="text-xs text-brand-text-secondary">Shared a Blueprint</p>
                </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{post.squad.name}</h3>
            <p className="text-sm text-brand-text-secondary flex-grow mb-4 line-clamp-2">{post.squad.description}</p>
            
            <div className="mb-4">
                <p className="text-xs font-semibold text-brand-text-secondary mb-2">Agents in Squad:</p>
                <div className="flex items-center -space-x-2">
                    {post.squad.agents.map(agent => (
                        <div key={agent.name} className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={`${agent.name}: ${agent.role}`}>
                            <Icon name={agent.icon} className={`w-4 h-4 ${agent.color}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-brand-border space-y-3">
                <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                    <span><Icon name="sparkles" className="w-3 h-3 inline mr-1" /> {post.likes.length} Likes</span>
                    <span><Icon name="message-circle" className="w-3 h-3 inline mr-1" /> {post.comments.length} Comments</span>
                    <span><Icon name="git-branch" className="w-3 h-3 inline mr-1" /> {post.clones} Clones</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => onStartConversation(post.author)}>
                        <Icon name="mail" className="w-4 h-4 mr-2" />
                        Discuss
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleClone}>
                        <Icon name={isCloned ? "check" : "git-branch"} className="w-4 h-4 mr-2" />
                        {isCloned ? "Cloned!" : "Clone"}
                    </Button>
                </div>
            </div>
        </Card>
    );
};


const BlueprintExchangePage: React.FC<{ user: User, onStartConversation: (author: CommunityAuthor) => void }> = ({ user, onStartConversation }) => {
    const [blueprints, setBlueprints] = useState<SquadBlueprintPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [agentFilter, setAgentFilter] = useState<string[]>([]);

    useEffect(() => {
        const loadBlueprints = async () => {
            setIsLoading(true);
            const data = await fetchBlueprints();
            setBlueprints(data);
            setIsLoading(false);
        };
        loadBlueprints();

        const filterRaw = sessionStorage.getItem('cosmos_blueprint_filter');
        if (filterRaw) {
            try {
                const filter = JSON.parse(filterRaw);
                if (filter.agents && Array.isArray(filter.agents)) {
                    setAgentFilter(filter.agents);
                }
            } catch(e) { console.error("Could not parse blueprint filter", e); }
            sessionStorage.removeItem('cosmos_blueprint_filter');
        }

    }, []);

    const filteredBlueprints = useMemo(() => {
        let filtered = blueprints;
        if(agentFilter.length > 0) {
            filtered = filtered.filter(bp => agentFilter.every(filterAgent => bp.squad.agents.some(squadAgent => squadAgent.name === filterAgent)));
        }
        if (!searchTerm) return filtered;
        return filtered.filter(bp =>
            bp.squad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bp.squad.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [blueprints, searchTerm, agentFilter]);

    return (
        <div className="p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                    <div className="flex items-center gap-4 mb-4">
                        <Icon name="git-branch" className="w-10 h-10 text-purple-400" />
                        <div>
                            <h1 className="text-4xl font-bold text-white">Blueprint Exchange</h1>
                            <p className="text-brand-text-secondary mt-1 text-lg">Discover and adopt powerful, community-vetted agent squads.</p>
                        </div>
                    </div>
                    <div className="relative mt-6 mb-8">
                        <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                        <Input
                            placeholder="Search for blueprints..."
                            className="pl-11 h-12 text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     {agentFilter.length > 0 && (
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm text-brand-text-secondary">Filtering for squads with:</span>
                            {agentFilter.map(agent => <Badge key={agent} className="border-purple-700 text-purple-300">{agent}</Badge>)}
                            <Button variant="ghost" size="sm" onClick={() => setAgentFilter([])}>Clear</Button>
                        </div>
                    )}
                </AnimatedSection>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Icon name="loader" className="w-10 h-10 text-purple-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBlueprints.map((post, index) => (
                            <AnimatedSection key={post.id} style={{ animationDelay: `${index * 0.05}s` }}>
                                <BlueprintExchangeCard post={post} user={user} onStartConversation={onStartConversation}/>
                            </AnimatedSection>
                        ))}
                    </div>
                )}
                {!isLoading && filteredBlueprints.length === 0 && (
                     <div className="text-center py-20 border-2 border-dashed border-brand-border rounded-lg">
                        <Icon name="search" className="w-12 h-12 mx-auto text-brand-text-secondary mb-4" />
                        <h3 className="text-xl font-semibold text-white">No Blueprints Found</h3>
                        <p className="text-brand-text-secondary mt-1">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlueprintExchangePage;