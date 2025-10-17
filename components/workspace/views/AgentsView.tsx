// components/workspace/views/AgentsView.tsx
import React from 'react';
import { User, WorkspaceView } from '../../../types';
import AgentsPage from '../../pages/AgentsPage';

interface AgentsViewProps {
    user: User;
    onViewChange: (view: WorkspaceView) => void;
}

const AgentsView: React.FC<AgentsViewProps> = ({ user, onViewChange }) => {
    return <AgentsPage user={user} onViewChange={onViewChange} />;
};

export default AgentsView;