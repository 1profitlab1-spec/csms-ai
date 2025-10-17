// components/workspace/views/DashboardView.tsx
import React, { useState } from 'react';
import { User, Mission, Agent } from '../../../types';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icons';
import { Card } from '../../ui/Card';
import { NewMissionModal } from '../../ui/NewMissionModal';
import { cosmosOrchestrator } from '../../../services/geminiService';
import { AnimatedSection } from '../../ui/AnimatedSection';

interface DashboardViewProps {
  user: User;
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
  onCreateMission: (mission: Mission) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, missions, onSelectMission, onCreateMission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewMissionSubmit = async (missionData: Omit<Mission, 'id' | 'document' | 'agents' | 'huddleMessages'>) => {
    setIsLoading(true);
    try {
        const savedSquadRaw = localStorage.getItem(`squad_${user.id}`);
        const preferredAgents = savedSquadRaw ? JSON.parse(savedSquadRaw) as Agent[] : undefined;

        const agents = await cosmosOrchestrator(missionData.title, missionData.details, missionData.jobRole, preferredAgents);
        const newMission: Mission = {
            id: `mission-${Date.now()}`,
            ...missionData,
            agents,
            document: [{
                id: `section-${Date.now()}`,
                content: `# ${missionData.title}\n\nThis is the beginning of your new mission document.`
            }],
            huddleMessages: [],
        };
        onCreateMission(newMission);
        setIsModalOpen(false);
    } catch (error) {
        console.error("Failed to create new mission:", error);
        // Here you could set an error state to show in the modal
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-transparent p-4 md:p-10">
      <AnimatedSection>
        <h1 id="welcome-tour-start" className="text-3xl md:text-4xl font-bold text-white">Welcome, {user.firstName}</h1>
        <p className="text-brand-text-secondary mt-2 text-md md:text-lg">Ready to start a new mission or continue an existing one?</p>
      </AnimatedSection>
      
      <AnimatedSection className="mt-8" style={{ animationDelay: '0.1s' }}>
        <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between bg-purple-950/40 border-purple-800">
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold">Start a New Mission</h2>
            <p className="text-brand-text-secondary mt-1">Assemble a new squad of AI agents for your next objective.</p>
          </div>
          <Button id="new-mission-button" size="lg" className="mt-4 md:mt-0 w-full md:w-auto" onClick={() => setIsModalOpen(true)}>
            <Icon name="plus" className="w-5 h-5 mr-2" />
            New Mission
          </Button>
        </Card>
      </AnimatedSection>
      
      <div className="mt-10">
        <AnimatedSection style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-white mb-4">Recent Missions</h2>
        </AnimatedSection>
        {missions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, index) => (
                <AnimatedSection key={mission.id} style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                    <Card
                        onClick={() => onSelectMission(mission)}
                        className="cursor-pointer hover:border-purple-600 transition-all duration-200 h-full flex flex-col"
                    >
                        <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                        <p className="text-brand-text-secondary text-sm mb-4 flex-grow line-clamp-2">
                          {mission.details || `A mission focused on ${mission.jobRole}.`}
                        </p>
                        <div className="flex items-center justify-between text-sm text-brand-text-secondary">
                          <div className="flex items-center -space-x-2">
                              {mission.agents.slice(0, 4).map(agent => (
                                  <div key={agent.name} className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-medium border-2 border-brand-dark" title={agent.name}>
                                      <Icon name={agent.icon} className={`w-4 h-4 ${agent.color}`} />
                                  </div>
                              ))}
                          </div>
                          <span>{mission.agents.length} Agents</span>
                        </div>
                    </Card>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection style={{ animationDelay: '0.3s' }}>
            <div className="text-center py-10 border-2 border-dashed border-brand-border rounded-lg">
              <Icon name="compass" className="w-12 h-12 mx-auto text-brand-text-secondary mb-3" />
              <p className="text-brand-text-secondary">You have no active missions.</p>
            </div>
          </AnimatedSection>
        )}
      </div>

      {isModalOpen && (
        <NewMissionModal 
            user={user}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleNewMissionSubmit}
            isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DashboardView;