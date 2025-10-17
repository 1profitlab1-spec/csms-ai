// components/workspace/views/CommunityView.tsx
import React from 'react';
import CommunityPage from '../../pages/CommunityPage';
import { User, WorkspaceView, Mission } from '../../../types';

interface CommunityViewProps {
  user: User;
  onViewChange: (view: WorkspaceView) => void;
  onCreateMission: (mission: Mission) => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ user, onViewChange, onCreateMission }) => {
    return <CommunityPage user={user} onViewChange={onViewChange} onCreateMission={onCreateMission} />;
};

export default CommunityView;