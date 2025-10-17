import React, { useState, useEffect, useRef } from 'react';
import { Agent, IconName } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { conductAgentTrialStream } from '../../services/geminiService';

interface AgentTrialModalProps {
  agent: Agent;
  onClose: () => void;
}

const AgentTrialModal: React.FC<AgentTrialModalProps> = ({ agent, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{ user: string; agent: string } | null>(null);
  const [hasAsked, setHasAsked] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading || hasAsked) return;

    setIsLoading(true);
    setHasAsked(true);
    setConversation({ user: input, agent: '' });

    try {
      const stream = conductAgentTrialStream(agent, input);
      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk;
        setConversation({ user: input, agent: fullResponse });
      }
    } catch (error) {
      console.error("Trial failed", error);
      setConversation(prev => ({ ...prev!, agent: "Sorry, I encountered an error." }));
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="glassmorphism w-full max-w-lg rounded-xl p-6 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-purple-900/50`}>
              <Icon name={agent.icon} className={`w-7 h-7 ${agent.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Interview: {agent.name}</h2>
              <p className="text-brand-text-secondary">{agent.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><Icon name="x" /></Button>
        </div>
        
        <div className="bg-brand-dark/50 rounded-lg p-4 flex-grow min-h-[200px] mb-4 overflow-y-auto">
          {!conversation ? (
            <p className="text-brand-text-secondary text-center p-8">You may ask one question to test this agent's capabilities before recruiting them.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-bold text-purple-300 mb-1">Your Question:</p>
                <p className="text-white whitespace-pre-wrap">{conversation.user}</p>
              </div>
              <div>
                <p className="font-bold text-purple-300 mb-1">{agent.name}'s Response:</p>
                <p className="text-white whitespace-pre-wrap">{conversation.agent}{isLoading && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={hasAsked ? "Trial complete." : `Ask ${agent.name} a question...`}
            rows={1}
            className="flex-1 resize-none"
            disabled={isLoading || hasAsked}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={isLoading || hasAsked || !input.trim()}>
            {isLoading ? <Icon name="loader" /> : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentTrialModal;
