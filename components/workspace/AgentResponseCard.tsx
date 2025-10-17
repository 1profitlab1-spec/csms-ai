
import React from 'react';
import { AgentResponse } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';

// FIX: This file was empty. Create a placeholder component to resolve module errors.
interface AgentResponseCardProps {
  response: AgentResponse;
}

const AgentResponseCard: React.FC<AgentResponseCardProps> = ({ response }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center mb-2">
        <Icon name={response.agent.icon} className={`w-5 h-5 mr-2 ${response.agent.color}`} />
        <h3 className="font-semibold">{response.agent.name}</h3>
      </div>
      <p className="text-sm text-cosmos-text-secondary whitespace-pre-wrap">{response.content}</p>
    </Card>
  );
};

export default AgentResponseCard;
