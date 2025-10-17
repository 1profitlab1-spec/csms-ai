// components/community/HubDetailPage.tsx
import React, { useState } from 'react';
import { Hub, User, Mission } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { AnimatedSection } from '../ui/AnimatedSection';
import { NewMissionModal } from '../ui/NewMissionModal';
import { cosmosOrchestrator } from '../../services/geminiService';

type HubDetailTab = 'discussions' | 'members' | 'blueprints';

interface HubDetailPageProps {
    user: User;
    hub: Hub;
    onBack: () => void;
    onToggleMembership: (hubId: string) => void;
    onCreateMission: (mission: Mission) => void;
}

const HubDetailPage: React.FC<HubDetailPageProps> = ({ user, hub, onBack, onToggleMembership, onCreateMission }) => {
    const [activeTab, setActiveTab] = useState<HubDetailTab>('discussions');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingMission, setIsLoadingMission] = useState(false);
    const isMember = hub.members.some(m => m.id === user.id);

    const handleMissionSubmit = async (missionData: Omit<Mission, 'id' | 'document' | 'agents'|'huddleMessages'>) => {
        setIsLoadingMission(true);
        try {
            const agents = await cosmosOrchestrator(missionData.title, missionData.details, missionData.jobRole);
            const newMission: Mission = {
                id: `mission-${Date.now()}`,
                ...missionData,
                agents,
                hubId: hub.id, // Tag mission with the hub ID
                document: [{
                    id: `section-${Date.now()}`,
                    content: `# ${missionData.title}\n\nThis mission was initiated from the ${hub.name} hub.`
                }],
                 huddleMessages: [],
            };
            onCreateMission(newMission);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create hub mission:", error);
        } finally {
            setIsLoadingMission(false);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'discussions':
                return <div className="text-center py-20 text-brand-text-secondary">Hub-specific discussions coming soon.</div>;
            case 'members':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hub.members.map(member => (
                            <Card key={member.id} className="p-4 flex items-center gap-4">
                                <Avatar src={member.avatarUrl} fallback={member.name.charAt(0)} />
                                <div>
                                    <p className="font-semibold text-white">{member.name}</p>
                                    <p className="text-sm text-brand-text-secondary">{member.jobRole}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                );
            case 'blueprints':
                 return <div className="text-center py-20 text-brand-text-secondary">Hub-specific blueprint sharing coming soon.</div>;
            default: return null;
        }
    }

    return (
        <div className="p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <AnimatedSection>
                    <Button variant="ghost" onClick={onBack} className="mb-4">
                        <Icon name="chevron-left" className="w-4 h-4 mr-2" />
                        Back to All Hubs
                    </Button>
                    <Card className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white">{hub.name}</h1>
                            <p className="text-brand-text-secondary mt-1">{hub.description}</p>
                             <p className="text-sm text-brand-text-secondary mt-2 flex items-center gap-2">
                                <Icon name="users" className="w-4 h-4" /> {hub.members.length} members
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                            <Button
                                size="lg"
                                variant={isMember ? 'destructive' : 'default'}
                                onClick={() => onToggleMembership(hub.id)}
                                className="w-full md:w-auto"
                            >
                                {isMember ? 'Leave Hub' : 'Join Hub'}
                            </Button>
                            {isMember && (
                                <Button size="lg" variant="outline" onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                                    <Icon name="plus" className="w-4 h-4 mr-2" />
                                    Launch Hub Mission
                                </Button>
                            )}
                        </div>
                    </Card>
                </AnimatedSection>
                
                <div className="flex items-center gap-2 border-b border-brand-border my-8">
                    <TabButton label="Discussions" isActive={activeTab === 'discussions'} onClick={() => setActiveTab('discussions')} />
                    <TabButton label="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
                    <TabButton label="Blueprints" isActive={activeTab === 'blueprints'} onClick={() => setActiveTab('blueprints')} />
                </div>

                {renderContent()}

            </div>

             {isModalOpen && (
                <NewMissionModal 
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleMissionSubmit}
                    isLoading={isLoadingMission}
                />
            )}
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


export default HubDetailPage;