// components/community/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, User } from '../../types';
import { Icon } from '../ui/Icons';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User;
  onSendMessage: (text: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, currentUser, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

  return (
    <div className="flex flex-col h-full bg-brand-dark">
      <header className="p-4 border-b border-brand-border flex items-center gap-3">
        <Avatar src={otherParticipant.avatarUrl} fallback={otherParticipant.name.charAt(0)} />
        <h2 className="text-lg font-bold text-white">{otherParticipant.name}</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map(msg => {
          const isCurrentUser = msg.senderId === currentUser.id;
          const sender = isCurrentUser ? currentUser : otherParticipant;
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              {!isCurrentUser && <Avatar src={sender.avatarUrl} fallback={sender.name.charAt(0)} className="w-8 h-8"/>}
              <div className={`rounded-lg px-4 py-2 max-w-md ${isCurrentUser ? 'bg-purple-600 text-white' : 'bg-brand-medium text-white'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-brand-border bg-brand-darker">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Icon name="send" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
