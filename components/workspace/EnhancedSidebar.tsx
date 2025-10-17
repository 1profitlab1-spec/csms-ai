import React from 'react';
import { User, WorkspaceView, IconName, Mission } from '../../types';
import { Icon } from '../ui/Icons';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
  className?: string;
}

interface NavItemProps {
  icon: IconName;
  label: string;
  view: WorkspaceView;
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
  id?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, currentView, onViewChange, id }) => {
  const isActive = currentView === view;
  return (
    <button
      id={id}
      onClick={() => onViewChange(view)}
      className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-purple-900/50 text-purple-200'
          : 'text-brand-text-secondary hover:bg-purple-900/30 hover:text-purple-300'
      }`}
    >
      <Icon name={icon} className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
};

const EnhancedSidebar: React.FC<SidebarProps> = ({ user, onLogout, currentView, onViewChange, missions, onSelectMission, className }) => {
  const mainNavItems: { icon: IconName, label: string, view: WorkspaceView, id?: string }[] = [
    { icon: 'home', label: 'Dashboard', view: 'dashboard' },
    { icon: 'message-circle', label: 'Chats', view: 'chats' },
    { icon: 'bot', label: 'Agents', view: 'agents', id: 'sidebar-agents-nav' },
    { icon: 'line-chart', label: 'Analytics', view: 'analytics' },
    { icon: 'users', label: 'Community', view: 'community', id: 'sidebar-community-nav' },
  ];

  return (
    <div className={`flex flex-col h-full bg-brand-darker border-r border-brand-border p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-6 px-2">
        <Icon name="compass" className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold tracking-tighter text-white">Cosmos</h1>
      </div>

      <nav className="space-y-1">
        {mainNavItems.map(item => (
          <NavItem key={item.view} {...item} currentView={currentView} onViewChange={onViewChange} />
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-brand-border">
          <h2 className="px-3 text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">Missions</h2>
          <div className="space-y-1 overflow-y-auto max-h-48">
              {missions.map(mission => (
                  <button
                    key={mission.id}
                    onClick={() => onSelectMission(mission)}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-brand-text-secondary hover:bg-purple-900/30 hover:text-purple-300 truncate"
                  >
                    <Icon name="message-square" className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{mission.title}</span>
                  </button>
              ))}
          </div>
      </div>


      <div className="mt-auto">
         <div className="border-t border-brand-border pt-4 mt-4 space-y-1">
            <NavItem icon="settings" label="Settings" view="settings" currentView={currentView} onViewChange={onViewChange} />
            <button
                onClick={onLogout}
                className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-brand-text-secondary hover:bg-brand-medium hover:text-white"
            >
                <Icon name="log-out" className="w-5 h-5 mr-3" />
                <span>Log Out</span>
            </button>
        </div>
        <div className="flex items-center gap-3 mt-4 p-2">
            <Avatar src={user.avatarUrl} fallback={user.firstName.charAt(0)} />
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                <span className="text-xs text-brand-text-secondary truncate">{user.jobRole || 'Professional'}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSidebar;
