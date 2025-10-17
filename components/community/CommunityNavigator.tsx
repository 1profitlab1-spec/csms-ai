// components/community/CommunityNavigator.tsx
import React from 'react';
import { User, CommunityView, IconName } from '../../types';
import { Icon } from '../ui/Icons';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface CommunityNavigatorProps {
  user: User;
  activeSection: CommunityView;
  onSectionChange: (section: CommunityView) => void;
  onReturnToWorkspace: () => void;
  className?: string;
}

interface NavItemProps {
  icon: IconName;
  label: string;
  section: CommunityView;
  activeSection: CommunityView;
  onSectionChange: (section: CommunityView) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, section, activeSection, onSectionChange }) => {
  const isActive = activeSection === section;
  return (
    <button
      onClick={() => onSectionChange(section)}
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

const CommunityNavigator: React.FC<CommunityNavigatorProps> = ({ user, activeSection, onSectionChange, onReturnToWorkspace, className }) => {
  const navItems: { icon: IconName; label: string; section: CommunityView }[] = [
    { icon: 'globe', label: 'Nexus', section: 'nexus' },
    { icon: 'user', label: 'My Hub Profile', section: 'profile' },
    { icon: 'users', label: 'Hubs', section: 'hubs' },
    { icon: 'shield', label: 'Agent Guilds', section: 'guilds' },
    { icon: 'git-branch', label: 'Blueprint Exchange', section: 'blueprints' },
    { icon: 'mail', label: 'Messages', section: 'messages' },
  ];

  return (
    <div className={`flex flex-col h-full bg-brand-darker border-r border-brand-border p-4 w-64 flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-3 mb-6 px-2">
        <Icon name="users" className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold tracking-tighter text-white">Nexus</h1>
      </div>

      <nav className="space-y-1">
        {navItems.map(item => (
          <NavItem key={item.section} {...item} activeSection={activeSection} onSectionChange={onSectionChange} />
        ))}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-brand-border pt-4 mt-4">
          <Button variant="outline" className="w-full" onClick={onReturnToWorkspace}>
            <Icon name="chevron-left" className="w-4 h-4 mr-2" />
            Return to Workspace
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-4 p-2">
          <Avatar src={user.avatarUrl} fallback={user.firstName.charAt(0)} />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">{user.name}</span>
            <span className="text-xs text-brand-text-secondary truncate">{user.jobRole || 'Cosmos Member'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityNavigator;