// components/community/ConversationList.tsx
import React, { useState, useMemo } from 'react';
import { Conversation, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';

interface ConversationListProps {
  user: User;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  activeConversationId?: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ user, conversations, onSelectConversation, activeConversationId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(convo => {
      const otherParticipant = convo.participants.find(p => p.id !== user.id);
      const lastMessage = convo.messages[convo.messages.length - 1];
      return (
        otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastMessage?.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [conversations, searchTerm, user.id]);

  return (
    <div className="w-80 border-r border-brand-border flex flex-col h-full bg-brand-darker">
      <div className="p-4 border-b border-brand-border">
        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
          <Input 
            placeholder="Search messages" 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-center text-sm text-brand-text-secondary p-4">No conversations yet.</p>
        ) : (
          filteredConversations.map(convo => {
            const otherParticipant = convo.participants.find(p => p.id !== user.id) || convo.participants[0];
            const lastMessage = convo.messages[convo.messages.length - 1];
            const isActive = convo.id === activeConversationId;
            return (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo)}
                className={`flex items-center gap-3 p-3 w-full text-left transition-colors ${isActive ? 'bg-purple-900/50' : 'hover:bg-brand-medium'}`}
              >
                <Avatar src={otherParticipant.avatarUrl} fallback={otherParticipant.name.charAt(0)} />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-white truncate">{otherParticipant.name}</p>
                  <p className="text-sm text-brand-text-secondary truncate">{lastMessage?.text || 'No messages yet'}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;