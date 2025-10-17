// components/pages/AgentsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { User, Agent, SquadPreset, SynergyReport, WorkspaceView, AgentLeaderboardStats } from '../../types';
import { ALL_AGENTS_POOL, DEFAULT_AGENTS, SQUAD_PRESETS } from '../../constants';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icons';
import { Badge } from '../ui/Badge';
import { AnimatedSection } from '../ui/AnimatedSection';
import AgentTrialModal from './AgentTrialModal';
import { Input } from '../ui/Input';
import { fetchCommunityFeed } from '../../services/communityService';

type AgentViewTab = 'roster' | 'recruit' | 'presets';

// Simple mock synergy calculator
const calculateSynergy = (squad: Agent[]): SynergyReport => {
    const roles = new Set(squad.map(a => a.role));
    let score = 0;
    if (roles.has("Marketing Agent") && roles.has("Content Creator")) score++;
    if (roles.has("Deep Thought & Research") && roles.has("Marketing Agent")) score++;
    if (roles.has("Social Media Strategist") && roles.has("Content Creator")) score++;
    if (roles.has("Sales Strategist") && roles.has("Conversion Specialist")) score++;
    
    let cohesion: SynergyReport['cohesion'] = 'Low';
    if (score >= 2) cohesion = 'High';
    else if (score === 1) cohesion = 'Medium';

    return {
        cohesion,
        summary: cohesion === 'High' ? "This is a well-balanced and highly collaborative squad." : "Consider adding agents with complementary skills to improve synergy.",
        connections: [] // Full implementation would populate this
    };
};

interface AgentsPageProps {
  user: User;
  onViewChange: (view: WorkspaceView) => void;
}

const AgentsPage: React.FC<AgentsPageProps> = ({ user, onViewChange }) => {
  const [activeTab, setActiveTab] = useState<AgentViewTab>('roster');
  const [mySquad, setMySquad] = useState<Agent[]>([]);
  const [userPresets, setUserPresets] = useState<SquadPreset[]>([]);
  const [trialAgent, setTrialAgent] = useState<Agent | null>(null);
  const [recruitmentSearch, setRecruitmentSearch] = useState('');
  const [agentStats, setAgentStats] = useState<AgentLeaderboardStats[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const savedSquad = localStorage.getItem(`squad_${user.id}`);
        if (savedSquad) {
            setMySquad(JSON.parse(savedSquad));
        } else {
            setMySquad(DEFAULT_AGENTS);
        }
        const savedPresets = localStorage.getItem(`presets_${user.id}`);
        if (savedPresets) {
            setUserPresets(JSON.parse(savedPresets));
        }
        const communityData = await fetchCommunityFeed(user.id);
        setAgentStats(communityData.agentStats);
    };
    loadData();
  }, [user.id]);

  useEffect(() => {
    localStorage.setItem(`squad_${user.id}`, JSON.stringify(mySquad));
  }, [mySquad, user.id]);

  useEffect(() => {
    localStorage.setItem(`presets_${user.id}`, JSON.stringify(userPresets));
  }, [userPresets, user.id]);

  const recruitAgent = (agent: Agent) => {
    if (!mySquad.find(a => a.name === agent.name)) {
      setMySquad(prev => [...prev, agent]);
      setActiveTab('roster'); // Switch to squad to show the new recruit
    }
  };

  const removeAgentFromSquad = (agent: Agent) => {
      setMySquad(prev => prev.filter(a => a.name !== agent.name));
  };
  
  const activatePreset = (preset: SquadPreset) => {
      setMySquad(preset.agents);
      setActiveTab('roster');
  };

  const isRecruited = (agent: Agent) => mySquad.some(a => a.name === agent.name);
  
  const handleSimulateSynergy = () => {
      const agentNames = mySquad.map(a => a.name).join(', ');
      const query = `Analyze the potential strengths and weaknesses of my current roster (${agentNames}) for a complex marketing campaign.`;
      sessionStorage.setItem('cosmos_analytics_query', query);
      onViewChange('analytics');
  };
  
  const handleViewAgentInGuilds = (agentName: string) => {
      sessionStorage.setItem('cosmos_community_nav', JSON.stringify({ view: 'guilds', highlight: agentName }));
      onViewChange('community');
  };

  const agentRanks = useMemo(() => {
    const ranks: { [key: string]: number } = {};
    const sortedBySuccess = [...agentStats].sort((a,b) => b.successContributions - a.successContributions);
    sortedBySuccess.forEach((stat, index) => {
        ranks[stat.agentName] = index + 1;
    });
    return ranks;
  }, [agentStats]);


  const renderContent = () => {
    switch (activeTab) {
      case 'roster':
        return <ActiveRosterView squad={mySquad} onRemoveAgent={removeAgentFromSquad} onSimulate={handleSimulateSynergy} />;
      case 'recruit':
        return <RecruitmentHubView 
                    onRecruit={recruitAgent} 
                    isRecruitedCheck={isRecruited} 
                    onConductTrial={setTrialAgent}
                    searchTerm={recruitmentSearch}
                    onSearchChange={setRecruitmentSearch}
                    agentRanks={agentRanks}
                    onViewInGuilds={handleViewAgentInGuilds}
                />;
      case 'presets':
        return <SquadPresetsView userPresets={userPresets} onActivate={activatePreset} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-transparent p-6 md:p-10">
      <AnimatedSection className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Agent Command Center</h1>
          <p className="text-brand-text-secondary text-lg">Manage your preferred roster of agents for upcoming missions.</p>
        </div>
      </AnimatedSection>

      <div className="flex items-center gap-2 border-b border-brand-border mb-8">
        <TabButton label="Active Roster" isActive={activeTab === 'roster'} onClick={() => setActiveTab('roster')} />
        <TabButton label="Recruitment Hub" isActive={activeTab === 'recruit'} onClick={() => setActiveTab('recruit')} />
        <TabButton label="Squad Presets" isActive={activeTab === 'presets'} onClick={() => setActiveTab('presets')} />
      </div>
      
      {renderContent()}

      {trialAgent && <AgentTrialModal agent={trialAgent} onClose={() => setTrialAgent(null)} />}
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

const ActiveRosterView: React.FC<{ squad: Agent[], onRemoveAgent: (agent: Agent) => void, onSimulate: () => void }> = ({ squad, onRemoveAgent, onSimulate }) => {
    const [synergy, setSynergy] = useState<SynergyReport | null>(null);
    
    useEffect(() => {
        setSynergy(calculateSynergy(squad));
    }, [squad]);

    return (
        <div>
            {synergy && (
                <AnimatedSection className="mb-8">
                    <Card className="bg-purple-950/50 border-purple-800">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Roster Synergy</h3>
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${synergy.cohesion === 'High' ? 'bg-green-500/20 text-green-300' : synergy.cohesion === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{synergy.cohesion}</div>
                                    <p className="text-brand-text-secondary flex-1">{synergy.summary}</p>
                                </div>
                            </div>
                            <Button onClick={onSimulate} className="w-full md:w-auto mt-4 md:mt-0">
                                <Icon name="lightbulb" className="w-4 h-4 mr-2" />
                                Simulate Synergy
                            </Button>
                        </div>
                    </Card>
                </AnimatedSection>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {squad.map((agent, index) => (
                <AnimatedSection key={agent.name} style={{ animationDelay: `${index * 0.05}s` }}>
                    <AgentCard agent={agent} onRemove={onRemoveAgent}/>
                </AnimatedSection>
                ))}
            </div>
        </div>
    );
};

interface RecruitmentHubViewProps {
    onRecruit: (agent: Agent) => void;
    isRecruitedCheck: (agent: Agent) => boolean;
    onConductTrial: (agent: Agent) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    agentRanks: { [key: string]: number };
    onViewInGuilds: (agentName: string) => void;
}

const RecruitmentHubView: React.FC<RecruitmentHubViewProps> = ({ onRecruit, isRecruitedCheck, onConductTrial, searchTerm, onSearchChange, agentRanks, onViewInGuilds }) => {
    const filteredAgents = useMemo(() => {
        if (!searchTerm.trim()) {
            return ALL_AGENTS_POOL;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return ALL_AGENTS_POOL.filter(agent =>
            agent.name.toLowerCase().includes(lowercasedFilter) ||
            agent.role.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm]);

    return (
        <div>
            <AnimatedSection>
                <div className="relative mb-8 max-w-lg">
                    <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
                    <Input
                        placeholder="Search agents by name or role..."
                        className="pl-11 h-12 text-base"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAgents.map((agent, index) => (
                    <AnimatedSection key={agent.name} style={{ animationDelay: `${index * 0.05}s` }}>
                        <AgentCard 
                            agent={agent} 
                            onRecruit={onRecruit} 
                            isRecruited={isRecruitedCheck(agent)} 
                            onConductTrial={onConductTrial}
                            rank={agentRanks[agent.name]}
                            onViewInGuilds={onViewInGuilds}
                         />
                    </AnimatedSection>
                ))}
            </div>
            {filteredAgents.length === 0 && (
                <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-border rounded-lg">
                    <Icon name="bot" className="w-12 h-12 mx-auto text-brand-text-secondary mb-3" />
                    <p className="text-brand-text-secondary">No agents found matching your search.</p>
                </div>
            )}
        </div>
    );
};

const SquadPresetsView: React.FC<{ userPresets: SquadPreset[], onActivate: (preset: SquadPreset) => void }> = ({ userPresets, onActivate }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-4">Suggested Presets</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {SQUAD_PRESETS.map(preset => <PresetCard key={preset.name} preset={preset} onActivate={onActivate} />)}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Your Saved Presets</h2>
        {userPresets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPresets.map(preset => <PresetCard key={preset.name} preset={preset} onActivate={onActivate} />)}
            </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed border-brand-border rounded-lg">
                <p className="text-brand-text-secondary">You haven't saved any squad presets yet.</p>
            </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-center text-center p-10 bg-transparent rounded-lg border border-dashed border-brand-border">
            <Icon name="users" className="w-16 h-16 text-brand-text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Community Presets</h2>
            <p className="text-brand-text-secondary text-lg max-w-md">
                Coming soon: Browse and import battle-tested squad presets from the Cosmos community.
            </p>
        </div>
    </div>
);

const PresetCard: React.FC<{preset: SquadPreset, onActivate: (preset: SquadPreset) => void}> = ({ preset, onActivate }) => (
    <Card className="flex flex-col p-6 h-full">
        <h3 className="text-xl font-semibold mb-2">{preset.name}</h3>
        <p className="text-sm text-brand-text-secondary flex-grow mb-4">{preset.description}</p>
        <div className="flex items-center -space-x-2 mb-4">
            {preset.agents.map(agent => (
                <div key={agent.name} className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={agent.name}>
                    <Icon name={agent.icon} className={`w-4 h-4 ${agent.color}`} />
                </div>
            ))}
        </div>
        <Button className="w-full mt-auto" variant="outline" onClick={() => onActivate(preset)}>Activate Roster</Button>
    </Card>
);

const AgentCard: React.FC<{ 
    agent: Agent, 
    onRecruit?: (agent: Agent) => void, 
    isRecruited?: boolean, 
    onConductTrial?: (agent: Agent) => void,
    onRemove?: (agent: Agent) => void,
    rank?: number,
    onViewInGuilds?: (agentName: string) => void
}> = ({ agent, onRecruit, isRecruited, onConductTrial, onRemove, rank, onViewInGuilds }) => (
    <Card className="flex flex-col p-6 h-full transition-all hover:border-purple-800 hover:-translate-y-1 relative">
        {onRemove && (
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-brand-text-secondary hover:text-red-400" onClick={() => onRemove(agent)}>
                <Icon name="x" className="w-4 h-4" />
            </Button>
        )}
        {rank && onViewInGuilds && (
             <button onClick={() => onViewInGuilds(agent.name)} className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-purple-900/80 px-2 py-1 rounded-full text-purple-200 hover:bg-purple-800 transition-colors">
                <Icon name="crown" className="w-3 h-3" />
                <span>Rank #{rank}</span>
            </button>
        )}
        <div className="flex items-center gap-4 mb-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-purple-900/50`}>
                <Icon name={agent.icon} className={`w-7 h-7 ${agent.color}`} />
            </div>
            <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
                <Badge className="mt-1 border-purple-700 text-purple-300">{agent.role}</Badge>
            </div>
        </div>
        <p className="text-sm text-brand-text-secondary flex-grow mb-4">{agent.personality}</p>
        {onRecruit && (
            <div className="mt-auto flex gap-2">
                <Button 
                    className="w-full" 
                    variant={isRecruited ? 'secondary' : 'outline'}
                    onClick={() => !isRecruited && onRecruit(agent)}
                    disabled={isRecruited}
                >
                    <Icon name={isRecruited ? 'check' : 'plus'} className="w-4 h-4 mr-2" />
                    {isRecruited ? 'Recruited' : 'Recruit'}
                </Button>
                {onConductTrial && (
                     <Button variant="ghost" size="icon" onClick={() => onConductTrial(agent)} title="Conduct Trial">
                        <Icon name="flask-round" className="w-5 h-5" />
                    </Button>
                )}
            </div>
        )}
    </Card>
);

export default AgentsPage;