// components/pages/ChatPage.tsx
import React, { useState, useEffect } from 'react';
import { Mission, User, HuddleMessage, Section, Agent } from '../../types';
import ChatHistorySidebar from '../chat/ChatHistorySidebar';
import LivingDocumentView from '../document/LivingDocumentView';
import AgentHuddle from '../document/AgentHuddle';
import { documentGeneratorStream, cosmosOrchestrator } from '../../services/geminiService';
import { NewMissionModal } from '../ui/NewMissionModal';

interface ChatPageProps {
  user: User;
  missions: Mission[];
  activeMission: Mission;
  onSelectMission: (missionId: string) => void;
  onCreateMission: (newMission: Mission) => void;
  onDocumentUpdate: (missionId: string, updatedDocument: Section[]) => void;
  onHuddleUpdate: (missionId: string, updatedHuddleMessages: HuddleMessage[]) => void;
  onGoToWorkspace: () => void;
}

type MobileChatView = 'history' | 'document' | 'huddle';

const ChatPage: React.FC<ChatPageProps> = ({
  user,
  missions,
  activeMission,
  onSelectMission,
  onCreateMission,
  onDocumentUpdate,
  onHuddleUpdate,
  onGoToWorkspace,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isHuddleVisible, setIsHuddleVisible] = useState(true);
  const [isUpdatingDocument, setIsUpdatingDocument] = useState(false);
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [newMissionLoading, setNewMissionLoading] = useState(false);
  
  const [placementModeActive, setPlacementModeActive] = useState(false);
  const [visualToPlace, setVisualToPlace] = useState<{ code: string; type: 'mermaid' | 'image' } | null>(null);
  
  const [mobileView, setMobileView] = useState<MobileChatView>('document');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const documentContentForHuddle = activeMission.document.map(s => s.content).join('\n\n---\n\n');
  
  const handleHuddleUpdate = (updatedMessages: HuddleMessage[]) => {
      onHuddleUpdate(activeMission.id, updatedMessages);
  };
  
  const handleExecuteDocumentCommand = async (command: string) => {
    setIsUpdatingDocument(true);
    try {
        const stream = documentGeneratorStream(command, activeMission.document, activeMission.agents);
        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk;
            const updatedSections = fullResponse.split('\n\n---\n\n').map((content, index) => ({
                id: activeMission.document[index]?.id || `section-${Date.now()}-${index}`,
                content: content
            }));
            onDocumentUpdate(activeMission.id, updatedSections);
        }
    } catch (error) {
        console.error("Failed to execute document command:", error);
    } finally {
        setIsUpdatingDocument(false);
    }
  };

  const handlePromoteToDocument = (text: string) => {
    const newSection: Section = {
        id: `section-promo-${Date.now()}`,
        content: text
    };
    const updatedDocument = [...activeMission.document, newSection];
    onDocumentUpdate(activeMission.id, updatedDocument);
  };

  const handleNewMissionSubmit = async (missionData: Omit<Mission, 'id' | 'document' | 'agents' | 'huddleMessages'>) => {
    setNewMissionLoading(true);
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
                content: `# ${missionData.title}\n\nThis is your new mission document.`
            }],
            huddleMessages: [],
        };
        onCreateMission(newMission);
        setIsNewMissionModalOpen(false);
    } catch (error) {
        console.error("Failed to create new mission:", error);
    } finally {
        setNewMissionLoading(false);
    }
  };
  
  const handleInitiatePlacement = (code: string, type: 'mermaid' | 'image') => {
    setVisualToPlace({ code, type });
    setPlacementModeActive(true);
    if(isMobile) setMobileView('document'); else setIsHuddleVisible(false);
  };

  const handlePlaceVisual = (insertIndex: number) => {
    if (!visualToPlace) return;
    
    const docString = documentContentForHuddle;
    const prefix = docString.substring(0, insertIndex);
    const suffix = docString.substring(insertIndex);
    
    let visualMarkdown = '';
    if (visualToPlace.type === 'mermaid') {
        visualMarkdown = `\n\`\`\`mermaid\n${visualToPlace.code}\n\`\`\`\n`;
    } else { // image
        visualMarkdown = `\n![Generated Image](${visualToPlace.code})\n`;
    }

    const newDocString = prefix + visualMarkdown + suffix;
    
    const updatedSections = newDocString.split('\n\n---\n\n').map((content, index) => ({
        id: activeMission.document[index]?.id || `section-vis-${Date.now()}-${index}`,
        content: content
    }));
    onDocumentUpdate(activeMission.id, updatedSections);
    
    setPlacementModeActive(false);
    setVisualToPlace(null);
  };
  
  const handleCancelPlacement = () => {
      setPlacementModeActive(false);
      setVisualToPlace(null);
  }

  const renderDesktopView = () => (
     <>
        {isSidebarVisible && (
            <ChatHistorySidebar
                user={user}
                missions={missions}
                activeMission={activeMission}
                onSelectMission={onSelectMission}
                onGoToWorkspace={onGoToWorkspace}
                onToggleSidebar={() => setIsSidebarVisible(false)}
                onNewMissionClick={() => setIsNewMissionModalOpen(true)}
                className="w-72 flex-shrink-0"
            />
        )}
        
        <LivingDocumentView
            user={user}
            mission={activeMission}
            isUpdating={isUpdatingDocument}
            placementModeActive={placementModeActive}
            onPlaceVisual={handlePlaceVisual}
            onCancelPlacement={handleCancelPlacement}
            onToggleHuddle={() => setIsHuddleVisible(p => !p)}
            onToggleSidebar={() => setIsSidebarVisible(p => !p)}
            isSidebarVisible={isSidebarVisible}
            isHuddleVisible={isHuddleVisible}
        />

        {isHuddleVisible && (
            <div className="w-full lg:w-[450px] flex-shrink-0 transition-all duration-300 ease-in-out">
                <AgentHuddle
                    user={user}
                    mission={activeMission}
                    documentContent={documentContentForHuddle}
                    messages={activeMission.huddleMessages || []}
                    onHuddleUpdate={handleHuddleUpdate}
                    onExecuteDocumentCommand={handleExecuteDocumentCommand}
                    onPromoteToDocument={handlePromoteToDocument}
                    onInitiatePlacement={handleInitiatePlacement}
                />
            </div>
        )}
    </>
  );

  const renderMobileView = () => {
      if (mobileView === 'history') {
          return (
            <ChatHistorySidebar
                user={user}
                missions={missions}
                activeMission={activeMission}
                onSelectMission={(missionId) => {
                    onSelectMission(missionId);
                    setMobileView('document');
                }}
                onGoToWorkspace={onGoToWorkspace}
                onToggleSidebar={() => setMobileView('document')}
                onNewMissionClick={() => setIsNewMissionModalOpen(true)}
                className="w-full flex-shrink-0"
            />
          );
      }
      if (mobileView === 'huddle') {
          return (
            <div className="w-full flex-shrink-0">
                <AgentHuddle
                    user={user}
                    mission={activeMission}
                    documentContent={documentContentForHuddle}
                    messages={activeMission.huddleMessages || []}
                    onHuddleUpdate={handleHuddleUpdate}
                    onExecuteDocumentCommand={handleExecuteDocumentCommand}
                    onPromoteToDocument={handlePromoteToDocument}
                    onInitiatePlacement={handleInitiatePlacement}
                    onMobileBack={() => setMobileView('document')}
                />
            </div>
          );
      }
      return (
        <LivingDocumentView
            user={user}
            mission={activeMission}
            isUpdating={isUpdatingDocument}
            placementModeActive={placementModeActive}
            onPlaceVisual={handlePlaceVisual}
            onCancelPlacement={handleCancelPlacement}
            onToggleHuddle={() => setMobileView('huddle')}
            onToggleSidebar={() => setMobileView('history')}
            isSidebarVisible={false} // On mobile, this controls the nav button
            isHuddleVisible={false} // On mobile, this controls the nav button
        />
      );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
        {isMobile ? renderMobileView() : renderDesktopView()}
        
        {isNewMissionModalOpen && (
            <NewMissionModal 
                user={user}
                onClose={() => setIsNewMissionModalOpen(false)}
                onSubmit={handleNewMissionSubmit}
                isLoading={newMissionLoading}
            />
        )}
    </div>
  );
};

export default ChatPage;