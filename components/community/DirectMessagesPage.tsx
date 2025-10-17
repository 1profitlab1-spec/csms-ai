// components/community/DirectMessagesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Conversation, User } from '../../types';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { Icon } from '../ui/Icons';
import * as communityService from '../../services/communityService';

interface DirectMessagesPageProps {
  user: User;
  activeConversationId: string | null;
  onSetActiveConversationId: (id: string | null) => void;
}

const DirectMessagesPage: React.FC<DirectMessagesPageProps> = ({ user, activeConversationId, onSetActiveConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const loadData = useCallback(async () => {
    const convos = await communityService.fetchConversations(user.id);
    setConversations(convos);
    if (!activeConversationId && convos.length > 0) {
      onSetActiveConversationId(convos[0].id);
    }
    setIsLoading(false);
  }, [user.id, activeConversationId, onSetActiveConversationId]);

  useEffect(() => {
    loadData();
    // Set up a poller to simulate real-time updates
    const interval = setInterval(async () => {
        const latestDb = await communityService.fetchCommunityFeed(user.id);
        setConversations(latestDb.conversations);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [user.id, loadData]);

  const handleSendMessage = async (text: string) => {
    if (!activeConversation) return;
    const updatedDb = await communityService.sendMessage(activeConversation.id, user.id, text);
    setConversations(updatedDb.conversations);
  };

  return (
    <div className="flex h-full">
      <ConversationList
        user={user}
        conversations={conversations}
        onSelectConversation={(convo) => onSetActiveConversationId(convo.id)}
        activeConversationId={activeConversationId}
      />
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center"><Icon name="loader" /></div>
        ) : activeConversation ? (
          <ChatWindow
            key={activeConversation.id} // Add key to force re-mount on convo change
            conversation={activeConversation}
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-brand-text-secondary">
            <div>
              <Icon name="mail" className="w-12 h-12 mx-auto mb-4" />
              <p>Select a conversation to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesPage;