// components/workspace/Workspace.tsx
import React, { useState } from 'react';
import { User, Mission, WorkspaceView, TourStep } from '../../types';
import EnhancedSidebar from './EnhancedSidebar';
import DashboardView from './views/DashboardView';
import ChatsHomeView from './views/ChatsHomeView';
import AgentsView from './views/AgentsView';
import AnalyticsView from './views/AnalyticsView';
import CommunityView from './views/CommunityView';
import SettingsView from './views/SettingsView';
import { useOnboardingTour } from '../../hooks/useOnboardingTour';
import Tooltip from '../ui/Tooltip';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icons';

interface WorkspaceProps {
  user: User;
  missions: Mission[];
  onLogout: () => void;
  onCreateMission: (mission: Mission) => void;
  onSelectMission: (mission: Mission) => void;
  onUserUpdate: (user: User) => void;
  onDeleteAllMissions: () => void;
}

const tourSteps: TourStep[] = [
    {
        targetId: 'welcome-tour-start',
        title: 'Welcome to Cosmos!',
        content: 'This is your dashboard, the central hub for all your missions.',
        position: 'bottom',
    },
    {
        targetId: 'new-mission-button',
        title: 'Start a Mission',
        content: "Click here to begin a new mission. We'll assemble a specialized AI squad for you based on your goals.",
        position: 'left',
    },
    {
        targetId: 'sidebar-agents-nav',
        title: 'Manage Your Agents',
        content: 'Here you can view, recruit, and manage your preferred roster of agents for future missions.',
        position: 'right',
    },
    {
        targetId: 'sidebar-community-nav',
        title: 'Join the Community',
        content: "Explore the Nexus to connect with other users, share insights, and discover powerful squad blueprints.",
        position: 'right',
    },
];


const Workspace: React.FC<WorkspaceProps> = ({ user, missions, onLogout, onCreateMission, onSelectMission, onUserUpdate, onDeleteAllMissions }) => {
  const [currentView, setCurrentView] = useState<WorkspaceView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTourComplete = () => {
    const updatedUser = { ...user, isNewUser: false };
    onUserUpdate(updatedUser);
  };
  
  const { isTourActive, currentStep, nextStep, skipTour } = useOnboardingTour(
    !!user.isNewUser, 
    handleTourComplete, 
    tourSteps
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView user={user} missions={missions} onCreateMission={onCreateMission} onSelectMission={onSelectMission} />;
      case 'chats':
        return <ChatsHomeView missions={missions} onSelectMission={onSelectMission} />;
      case 'agents':
        return <AgentsView user={user} onViewChange={setCurrentView} />;
      case 'analytics':
        return <AnalyticsView user={user} missions={missions} onCreateMission={onCreateMission} onViewChange={setCurrentView} />;
      case 'community':
        return <CommunityView user={user} onViewChange={setCurrentView} onCreateMission={onCreateMission} />;
      case 'settings':
        return <SettingsView user={user} onUserUpdate={onUserUpdate} onDeleteAllMissions={onDeleteAllMissions} />;
      default:
        return <DashboardView user={user} missions={missions} onCreateMission={onCreateMission} onSelectMission={onSelectMission} />;
    }
  };

  const viewTitles: Record<WorkspaceView, string> = {
      dashboard: 'Dashboard',
      chats: 'Chats',
      agents: 'Agent Command Center',
      analytics: 'Analytics',
      community: 'Community',
      settings: 'Settings',
      mission: 'Mission'
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {isMobileSidebarOpen && currentView !== 'community' && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <EnhancedSidebar
        user={user}
        onLogout={onLogout}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setIsMobileSidebarOpen(false);
        }}
        missions={missions}
        onSelectMission={(mission) => {
            onSelectMission(mission);
            setIsMobileSidebarOpen(false);
        }}
        className={`w-64 flex-shrink-0 transition-transform duration-300 ease-in-out ${currentView === 'community' ? 'hidden' : ''} md:relative md:translate-x-0 fixed h-full z-40 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      />
      
      <main className="flex-1 overflow-y-auto bg-brand-dark">
        {currentView !== 'community' && (
          <div className="md:hidden sticky top-0 z-20 bg-brand-darker/80 backdrop-blur-sm p-2 border-b border-brand-border flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)}>
              <Icon name="menu" className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-semibold">{viewTitles[currentView]}</h1>
          </div>
        )}
        {renderView()}
      </main>
      
      {isTourActive && currentStep && (
          <Tooltip 
            targetId={currentStep.targetId}
            title={currentStep.title}
            content={currentStep.content}
            position={currentStep.position}
            onNext={nextStep}
            onSkip={skipTour}
            currentStepIndex={tourSteps.findIndex(s => s.targetId === currentStep.targetId)}
            totalSteps={tourSteps.length}
          />
      )}
    </div>
  );
};

export default Workspace;