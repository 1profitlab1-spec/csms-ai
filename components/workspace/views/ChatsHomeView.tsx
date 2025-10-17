// components/workspace/views/ChatsHomeView.tsx
import React, { useState, useMemo } from 'react';
import { Mission } from '../../../types';
import { Icon } from '../../ui/Icons';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { AnimatedSection } from '../../ui/AnimatedSection';

interface ChatsHomeViewProps {
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
}

const ChatsHomeView: React.FC<ChatsHomeViewProps> = ({ missions, onSelectMission }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMissions = useMemo(() => {
    if (!searchTerm) return missions;
    return missions.filter(mission =>
      mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [missions, searchTerm]);

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-transparent p-6 md:p-10">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white">Missions & Chats</h1>
        <p className="text-brand-text-secondary mt-2 text-lg">Select a mission to continue the conversation.</p>
      </AnimatedSection>

      <div className="mt-8 mb-6 sticky top-0 bg-brand-dark/80 backdrop-blur-sm py-4 z-10">
        <div className="relative">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-secondary" />
          <Input
            placeholder="Search missions..."
            className="pl-11 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map((mission, index) => (
             <AnimatedSection key={mission.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <Card
                    onClick={() => onSelectMission(mission)}
                    className="cursor-pointer hover:border-purple-600 transition-all duration-200 h-full flex flex-col"
                >
                    <h3 className="text-xl font-semibold mb-2">{mission.title}</h3>
                    <p className="text-brand-text-secondary text-sm mb-4 flex-grow line-clamp-3">
                        {mission.details || `A mission focused on ${mission.jobRole}.`}
                    </p>
                    <div className="flex items-center justify-between text-sm text-brand-text-secondary mt-auto pt-4 border-t border-brand-border">
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
        <AnimatedSection>
            <div className="text-center py-16 border-2 border-dashed border-brand-border rounded-lg">
            <Icon name="message-circle" className="w-12 h-12 mx-auto text-brand-text-secondary mb-4" />
            <h2 className="text-xl font-semibold text-white">No Missions Found</h2>
            <p className="text-brand-text-secondary mt-1">
                {searchTerm ? "Try a different search term." : "Create a new mission from the dashboard."}
            </p>
            </div>
        </AnimatedSection>
      )}
    </div>
  );
};

export default ChatsHomeView;
