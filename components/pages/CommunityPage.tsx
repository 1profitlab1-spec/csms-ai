// components/pages/CommunityPage.tsx
import React, { useState, useEffect } from 'react';
import { User, WorkspaceView, Mission, CommunityView, CommunityDb, Conversation, CommunityAuthor } from '../../types';
import CommunityNavigator from '../community/CommunityNavigator';
import ComingSoonPage from '../community/ComingSoonPage';
import MyHubProfilePage from '../community/MyHubProfilePage';
import NexusFeed from '../community/NexusFeed';
import { fetchCommunityFeed, togglePostLike, createComment } from '../../services/communityService';
import toast from 'react-hot-toast';
import BlueprintExchangePage from '../community/BlueprintExchangePage';
import DirectMessagesPage from '../community/DirectMessagesPage';
import HubsPage from '../community/HubsPage';
import HubDetailPage from '../community/HubDetailPage';
import AgentGuildsPage from '../community/AgentGuildsPage';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';

interface CommunityPageProps {
  user: User;
  onViewChange: (view: WorkspaceView) => void;
  onCreateMission: (mission: Mission) => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ user, onViewChange, onCreateMission }) => {
  const [activeSection, setActiveSection] = useState<CommunityView>('nexus');
  const [db, setDb] = useState<CommunityDb | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeHubId, setActiveHubId] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchCommunityFeed(user.id);
        setDb(data);
        setIsLoading(false);
    };
    loadData();

    const navStateRaw = sessionStorage.getItem('cosmos_community_nav');
    if (navStateRaw) {
        try {
            const navState = JSON.parse(navStateRaw);
            if (navState.view) setActiveSection(navState.view);
        } catch(e) { console.error("Could not parse community nav state", e)}
        sessionStorage.removeItem('cosmos_community_nav');
    }
  }, [user.id]);
  
  const handleToggleLike = async (postId: string) => {
    if (!db) return;
    const updatedDb = await togglePostLike(postId, user.id);
    setDb(updatedDb);
  };
  
  const handleCreateComment = async (postId: string, content: string) => {
    if (!db) return;
    const author: CommunityAuthor = {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl || '',
        jobRole: user.jobRole
    };
    const updatedDb = await createComment(postId, author, content);
    setDb(updatedDb);
  };
  
  const handleStartConversation = (author: {id: string, name: string, avatarUrl: string}) => {
      if (author.id === user.id) {
          toast.error("You cannot message yourself.");
          return;
      }
      setActiveSection('messages');
      toast.success(`Started a conversation with ${author.name}.`);
  };

  const handleToggleHubMembership = (hubId: string) => {
      if (!db) return;
      const hub = db.hubs.find(h => h.id === hubId);
      if (!hub) return;
      
      const isMember = hub.members.some(m => m.id === user.id);
      if (isMember) {
          hub.members = hub.members.filter(m => m.id !== user.id);
          toast.success(`You left the ${hub.name} hub.`);
      } else {
          hub.members.push({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, jobRole: user.jobRole });
          toast.success(`Welcome to the ${hub.name} hub!`);
      }
      setDb({...db});
  };

  const sectionTitles: Record<CommunityView, string> = {
      nexus: "Nexus",
      profile: "My Hub Profile",
      hubs: "Hubs",
      guilds: "Agent Guilds",
      blueprints: "Blueprint Exchange",
      messages: "Messages"
  };

  const renderContent = () => {
    if (isLoading || !db) {
        return <div className="flex items-center justify-center h-full"><Icon name="loader" className="w-8 h-8"/></div>
    }
    
    if (activeHubId) {
        const hub = db.hubs.find(h => h.id === activeHubId);
        if (hub) {
            return <HubDetailPage user={user} hub={hub} onBack={() => setActiveHubId(null)} onToggleMembership={handleToggleHubMembership} onCreateMission={onCreateMission} />
        }
    }

    switch (activeSection) {
      case 'nexus':
        return <NexusFeed user={user} feed={db.feed} onToggleLike={handleToggleLike} onAddComment={handleCreateComment} onStartConversation={handleStartConversation} />;
      case 'profile':
        return <MyHubProfilePage user={user} />;
      case 'hubs':
        return <HubsPage user={user} hubs={db.hubs} onSelectHub={setActiveHubId} onToggleMembership={handleToggleHubMembership} />;
      case 'guilds':
        return <AgentGuildsPage user={user} stats={db.agentStats} nominatedAgents={db.nominatedAgents} onVote={(agentId) => console.log('voted for', agentId)} />;
      case 'blueprints':
        return <BlueprintExchangePage user={user} onStartConversation={handleStartConversation} />;
      case 'messages':
        return <DirectMessagesPage user={user} activeConversationId={activeConversationId} onSetActiveConversationId={setActiveConversationId} />;
      default:
        return <ComingSoonPage title="Under Construction" description="This part of the community hub is still being developed." icon="building" />;
    }
  };

  return (
    <div className="flex h-full w-full">
       {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      <CommunityNavigator 
        user={user}
        activeSection={activeSection} 
        onSectionChange={(section) => {
            setActiveSection(section);
            setIsMobileNavOpen(false);
        }}
        onReturnToWorkspace={() => onViewChange('dashboard')} 
        className={`transition-transform duration-300 ease-in-out md:relative md:translate-x-0 fixed h-full z-40 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}
      />
      <div className="flex-1 overflow-y-auto bg-brand-dark">
        <div className="md:hidden sticky top-0 z-20 bg-brand-darker/80 backdrop-blur-sm p-2 border-b border-brand-border flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(true)}>
                <Icon name="menu" className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-semibold">{sectionTitles[activeSection]}</h1>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default CommunityPage;