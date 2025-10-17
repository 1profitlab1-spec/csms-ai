import React, { useState } from 'react';
import { Agent, AgentResponse } from '../../types';
import { Icon } from '../ui/Icons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AgentResponseDropdownProps {
  responses: AgentResponse[];
  onApply?: (content: string) => void;
}

const AgentResponseDropdown: React.FC<AgentResponseDropdownProps> = ({ responses, onApply }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(responses.length > 0 ? responses[0].agent : null);

  if (responses.length === 0) {
    return null;
  }

  const selectedResponse = responses.find(r => r.agent.name === selectedAgent?.name);

  return (
    <Card className="relative bg-brand-medium border-brand-border p-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 rounded-t-md hover:bg-brand-dark"
      >
        <div className="flex items-center">
          {selectedAgent && <Icon name={selectedAgent.icon} className={`w-5 h-5 mr-2 ${selectedAgent.color}`} />}
          <span className="font-semibold text-sm">{selectedAgent?.name || 'Select Agent'}</span>
        </div>
        <Icon name="chevron-down" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-brand-darker border border-brand-border rounded-md shadow-lg z-10">
          {responses.map(response => (
            <button
              key={response.agent.name}
              onClick={() => {
                setSelectedAgent(response.agent);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-brand-dark"
            >
              <Icon name={response.agent.icon} className={`w-5 h-5 mr-2 ${response.agent.color}`} />
              <span className="text-sm">{response.agent.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-brand-border">
        {selectedResponse ? (
          <>
            <p className="text-sm text-brand-text-secondary whitespace-pre-wrap">{selectedResponse.content}</p>
            {onApply && (
                <div className="mt-3 text-right">
                    <Button variant="outline" size="sm" onClick={() => onApply(selectedResponse.content)}>
                        <Icon name="pen-tool" className="w-4 h-4 mr-2" />
                        Apply to Document
                    </Button>
                </div>
            )}
          </>
        ) : (
          <p className="text-sm text-brand-text-secondary">No response available.</p>
        )}
      </div>
    </Card>
  );
};

export default AgentResponseDropdown;
