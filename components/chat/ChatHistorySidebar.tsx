// components/chat/ChatHistorySidebar.tsx
import React, { useState } from 'react';
import { Mission, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';

interface ChatHistorySidebarProps {
  user: User;
  missions: Mission[];
  activeMission: Mission;
  onSelectMission: (missionId: string) => void;
  onGoToWorkspace: () => void;
  onToggleSidebar: () => void;
  onNewMissionClick: () => void;
  className?: string;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  user,
  missions,
  activeMission,
  onSelectMission,
  onGoToWorkspace,
  onToggleSidebar,
  onNewMissionClick,
  className,
}) => {
  return (
    <div className={`flex flex-col h-full bg-brand-darker border-r border-brand-border p-4 ${className} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 mb-6 px-2">
        <div className="flex items-center gap-3">
            <Icon name="compass" className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tighter text-white">Cosmos</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-brand-text-secondary hover:text-white">
            <Icon name="chevron-left" className="w-5 h-5" />
        </Button>
      </div>
      
      <Button variant="outline" onClick={onGoToWorkspace} className="mb-2">
        <Icon name="chevron-left" className="w-4 h-4 mr-2" />
        Back to Workspace
      </Button>

      <Button onClick={onNewMissionClick} className="mb-4 w-full">
        <Icon name="plus" className="w-4 h-4 mr-2" />
        New Mission
      </Button>

      <div>
        <h2 className="px-3 text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">Missions</h2>
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
          {missions.map(mission => {
            const isActive = mission.id === activeMission.id;
            return (
              <button
                key={mission.id}
                onClick={() => onSelectMission(mission.id)}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-left truncate transition-colors ${
                  isActive
                    ? 'bg-purple-900/50 text-purple-200'
                    : 'text-brand-text-secondary hover:bg-purple-900/30 hover:text-purple-300'
                }`}
              >
                <Icon name="message-square" className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{mission.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-2">
         <div className="flex items-center gap-3">
             <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-brand-medium">
                <span className="font-semibold">{user.firstName.charAt(0)}</span>
             </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                <span className="text-xs text-brand-text-secondary truncate">{user.jobRole || 'Professional'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar;