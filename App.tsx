import React, { useState, useEffect } from 'react';
import AuthPage from './components/pages/AuthPage';
import Workspace from './components/workspace/Workspace';
import ChatPage from './components/pages/ChatPage';
import { User, Mission, Section, HuddleMessage } from './types';
import { getMockUser, clearMockUser, updateMockUser } from './lib/auth';
import BackgroundBubbles from './components/BackgroundBubbles';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = getMockUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      const savedMissions = localStorage.getItem(`missions_${loggedInUser.id}`);
      if (savedMissions) {
        setMissions(JSON.parse(savedMissions));
      }
      const lastActiveMissionId = localStorage.getItem(`activeMissionId_${loggedInUser.id}`);
      if (lastActiveMissionId) {
          setActiveMissionId(lastActiveMissionId);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`missions_${user.id}`, JSON.stringify(missions));
    }
  }, [missions, user]);
  
  useEffect(() => {
    if (user && activeMissionId) {
        localStorage.setItem(`activeMissionId_${user.id}`, activeMissionId);
    } else if (user && !activeMissionId) {
        localStorage.removeItem(`activeMissionId_${user.id}`);
    }
  }, [activeMissionId, user]);


  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    clearMockUser();
    setUser(null);
    setMissions([]);
    setActiveMissionId(null);
  };
  
  const handleCreateMission = (newMission: Mission) => {
      setMissions(prev => [...prev, newMission]);
      setActiveMissionId(newMission.id);
  };
  
  const handleSelectMission = (mission: Mission) => {
      setActiveMissionId(mission.id);
  }

  const handleDocumentUpdate = (missionId: string, updatedDocument: Section[]) => {
      setMissions(prev => prev.map(m => m.id === missionId ? {...m, document: updatedDocument} : m));
  };
  
  const handleHuddleUpdate = (missionId: string, updatedHuddleMessages: HuddleMessage[]) => {
      setMissions(prev => prev.map(m => m.id === missionId ? {...m, huddleMessages: updatedHuddleMessages} : m));
  };
  
  const handleGoToWorkspace = () => {
      setActiveMissionId(null);
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    updateMockUser(updatedUser);
  };

  const handleDeleteAllMissions = () => {
    setMissions([]);
    if (user) {
        localStorage.removeItem(`missions_${user.id}`);
    }
  };

  const activeMission = missions.find(m => m.id === activeMissionId);

  if (isLoading) {
    return <div className="bg-cosmos-dark min-h-screen" />;
  }

  return (
    <div className="bg-cosmos-dark text-white font-sans min-h-screen">
      <BackgroundBubbles />
      <Toaster
        position="top-center"
        toastOptions={{
          className: '',
          style: {
            background: '#1f103a',
            color: '#e0cffc',
            border: '1px solid #4a0f8a',
          },
        }}
      />
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : activeMission ? (
        <ChatPage
            user={user}
            missions={missions}
            activeMission={activeMission}
            onSelectMission={(missionId) => setActiveMissionId(missionId)}
            onCreateMission={handleCreateMission}
            onDocumentUpdate={handleDocumentUpdate}
            onHuddleUpdate={handleHuddleUpdate}
            onGoToWorkspace={handleGoToWorkspace}
        />
      ) : (
        <Workspace 
          user={user}
          missions={missions}
          onLogout={handleLogout}
          onCreateMission={handleCreateMission}
          onSelectMission={handleSelectMission}
          onUserUpdate={handleUserUpdate}
          onDeleteAllMissions={handleDeleteAllMissions}
        />
      )}
    </div>
  );
};

export default App;