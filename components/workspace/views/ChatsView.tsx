
import React from 'react';
import { Agent } from '../../../types';
import { Icon } from '../../ui/Icons';

interface ChatsViewProps {
    onAgentSelect: (agent: Agent) => void; // Prop to switch to a chat view
}

const ChatsView: React.FC<ChatsViewProps> = ({ onAgentSelect }) => {
    // This is mock data. In a real app, this would come from state or an API.
    const recentChats = [
        // Example: { agent: SOME_AGENT, lastMessage: "...", timestamp: "..." }
    ];

    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-10 bg-transparent animate-fade-in">
            <Icon name="message-circle" className="w-16 h-16 text-cosmos-text-secondary mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Chats</h1>
            <p className="text-cosmos-text-secondary text-lg max-w-md">
                This area will display your conversation history with each agent.
            </p>
            {recentChats.length === 0 && (
                <p className="mt-4 text-cosmos-text-secondary">No recent chats. Start a conversation from the Dashboard or Agents view!</p>
            )}
        </div>
    );
};

export default ChatsView;
