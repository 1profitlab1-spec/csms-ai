// components/community/HubCard.tsx
import React from 'react';
import { Hub } from '../../types';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';

interface HubCardProps {
    hub: Hub;
    onSelectHub: (hubId: string) => void;
}

const HubCard: React.FC<HubCardProps> = ({ hub, onSelectHub }) => {
    return (
        <Card className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-2">{hub.name}</h3>
            <p className="text-sm text-brand-text-secondary flex-grow mb-4 line-clamp-2">{hub.description}</p>
            <div className="flex items-center text-sm text-brand-text-secondary mb-4">
                <Icon name="users" className="w-4 h-4 mr-2" />
                <span>{hub.members.length.toLocaleString()} members</span>
            </div>
            <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={() => onSelectHub(hub.id)}
            >
                View Hub
            </Button>
        </Card>
    );
};

export default HubCard;