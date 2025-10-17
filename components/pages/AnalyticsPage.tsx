import React, { useState, useEffect, useMemo } from 'react';
import { User, Mission, OracleInsight, Agent, AgentAnalytic, WorkspaceView, AgentLeaderboardStats } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { AnimatedSection } from '../ui/AnimatedSection';
import AgentConstellation from '../analytics/AgentConstellation';
import ScenarioSimulator from '../analytics/ScenarioSimulator';
import { getAnalyticsInsights, cosmosOrchestrator } from '../../services/geminiService';
import { NewMissionModal } from '../ui/NewMissionModal';
import { fetchCommunityFeed } from '../../services/communityService';

const ActivityGlobe: React.FC<{ missions: Mission[] }> = ({ missions }) => {
    const recentMissions = missions.slice(-5);
    return (
        <Card className="h-full">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Icon name="globe" className="w-5 h-5 text-purple-400" />
                Cosmos Activity
            </h3>
            <div className="space-y-3 mt-4">
                {recentMissions.length > 0 ? (
                    recentMissions.map(mission => (
                        <div key={mission.id} className="flex items-center gap-3 animate-pulse" style={{ animationDelay: `${Math.random() * 0.5}s`, animationDuration: '2s' }}>
                            <div className="w-8 h-8 rounded-full bg-purple-900/50 flex-shrink-0 flex items-center justify-center">
                                <Icon name="message-square" className="w-4 h-4 text-purple-300" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate text-white">{mission.title}</p>
                                <div className="flex items-center -space-x-2 mt-1">
                                    {mission.agents.slice(0, 3).map(agent => (
                                        <div key={agent.name} className="w-5 h-5 rounded-full flex items-center justify-center bg-brand-medium border border-brand-dark" title={agent.name}>
                                            <Icon name={agent.icon} className={`w-3 h-3 ${agent.color}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-brand-text-secondary text-center py-4">No recent activity.</p>
                )}
            </div>
        </Card>
    );
};

interface AnalyticsPageProps {
  user: User;
  missions: Mission[];
  onCreateMission: (newMission: Mission) => void;
  onViewChange: (view: WorkspaceView) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user, missions, onCreateMission, onViewChange }) => {
    const [oracleInsight, setOracleInsight] = useState<OracleInsight | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingMission, setIsLoadingMission] = useState(false);
    const [initialSimulatorQuery, setInitialSimulatorQuery] = useState<string | null>(null);

    useEffect(() => {
        const query = sessionStorage.getItem('cosmos_analytics_query');
        if (query) {
            setInitialSimulatorQuery(query);
            sessionStorage.removeItem('cosmos_analytics_query');
        }

        const loadInsights = async () => {
            if (missions.length > 0) {
                setIsLoadingInsight(true);
                try {
                    const communityData = await fetchCommunityFeed(user.id);
                    const insight = await getAnalyticsInsights(missions, user.jobRole || 'Professional', communityData.agentStats);
                    setOracleInsight(insight);
                } catch(err) {
                    console.error("Failed to load Oracle insights", err)
                } finally {
                    setIsLoadingInsight(false);
                }
            } else {
                setIsLoadingInsight(false);
            }
        };

        loadInsights();
    }, [missions, user.id, user.jobRole]);

    const agentAnalytics = useMemo((): AgentAnalytic[] => {
        const analytics: { [key: string]: { name: string; usage: number; synergies: { [key: string]: number } } } = {};
        
        missions.forEach(mission => {
            mission.agents.forEach((agent, i) => {
                if (!analytics[agent.name]) {
                    analytics[agent.name] = { name: agent.name, usage: 0, synergies: {} };
                }
                analytics[agent.name].usage++;
                
                mission.agents.forEach((otherAgent, j) => {
                    if (i === j) return;
                    if (!analytics[agent.name].synergies[otherAgent.name]) {
                        analytics[agent.name].synergies[otherAgent.name] = 0;
                    }
                    analytics[agent.name].synergies[otherAgent.name]++;
                });
            });
        });

        return Object.values(analytics).map(data => ({
            name: data.name,
            usage: data.usage,
            synergies: Object.entries(data.synergies).map(([withName, count]) => ({
                with: withName,
                count
            })).sort((a, b) => b.count - a.count)
        }));
    }, [missions]);

    const handleLaunchSuggestedMission = () => {
        if (oracleInsight) {
            setIsModalOpen(true);
        }
    };
    
    const handleMissionSubmit = async (missionData: Omit<Mission, 'id' | 'document' | 'agents'|'huddleMessages'>) => {
        setIsLoadingMission(true);
        try {
            const agents = await cosmosOrchestrator(missionData.title, missionData.details, missionData.jobRole);
            const newMission: Mission = {
                id: `mission-${Date.now()}`,
                ...missionData,
                agents,
                document: [{
                    id: `section-${Date.now()}`,
                    content: `# ${missionData.title}\n\n${missionData.details}`
                }],
                 huddleMessages: [],
            };
            onCreateMission(newMission);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create mission from suggestion:", error);
        } finally {
            setIsLoadingMission(false);
        }
    };

    if (missions.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-10 bg-transparent">
                <Icon name="line-chart" className="w-16 h-16 text-brand-text-secondary mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Mission Debriefing Room</h1>
                <p className="text-brand-text-secondary text-lg max-w-md">
                    Complete your first mission to unlock powerful strategic insights from Oracle.
                </p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full overflow-y-auto bg-transparent p-6 md:p-10">
            <AnimatedSection>
                <h1 className="text-4xl font-bold text-white mb-2">Mission Debriefing Room</h1>
                <p className="text-brand-text-secondary text-lg">Oracle is analyzing your performance and providing strategic insights.</p>
            </AnimatedSection>

            <AnimatedSection className="mt-8" style={{ animationDelay: '0.1s' }}>
                <Card className="bg-purple-950/40 border-purple-800 p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                        <Icon name="brain-circuit" className="w-7 h-7 text-purple-400" />
                        Oracle's Debrief
                    </h2>
                    {isLoadingInsight ? (
                         <div className="flex items-center gap-2 text-brand-text-secondary"><Icon name="loader" className="w-5 h-5"/>Analyzing mission data...</div>
                    ) : oracleInsight ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <p className="text-brand-text-secondary flex-1">{oracleInsight.summary}</p>
                            <Button onClick={handleLaunchSuggestedMission}>
                               <Icon name="lightbulb" className="w-5 h-5 mr-2" />
                                Explore Proactive Mission
                            </Button>
                        </div>
                    ) : <p className="text-brand-text-secondary">Could not load insights.</p>}
                </Card>
            </AnimatedSection>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AnimatedSection style={{ animationDelay: '0.2s' }}>
                         <AgentConstellation analytics={agentAnalytics} allAgents={missions.flatMap(m => m.agents)} onViewChange={onViewChange} />
                    </AnimatedSection>
                </div>
                <div className="flex flex-col gap-8">
                     <AnimatedSection style={{ animationDelay: '0.3s' }}>
                        <ActivityGlobe missions={missions} />
                    </AnimatedSection>
                    <AnimatedSection style={{ animationDelay: '0.4s' }}>
                       <ScenarioSimulator missions={missions} initialQuery={initialSimulatorQuery} />
                    </AnimatedSection>
                </div>
            </div>

            {isModalOpen && oracleInsight && (
                <NewMissionModal 
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleMissionSubmit}
                    isLoading={isLoadingMission}
                    // Pre-fill with Oracle's suggestion
                    initialData={{
                        title: oracleInsight.suggestion.title,
                        details: oracleInsight.suggestion.details,
                        jobRole: oracleInsight.suggestion.jobRole,
                        justification: oracleInsight.suggestion.justification,
                    }}
                />
            )}
        </div>
    );
};

export default AnalyticsPage;