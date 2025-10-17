import React from 'react';
import { User, Mission, WorkspaceView } from '../../../types';
import AnalyticsPage from '../../pages/AnalyticsPage';

interface AnalyticsViewProps {
    user: User;
    missions: Mission[];
    onCreateMission: (mission: Mission) => void;
    onViewChange: (view: WorkspaceView) => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, missions, onCreateMission, onViewChange }) => {
    return (
        <AnalyticsPage
            user={user}
            missions={missions}
            onCreateMission={onCreateMission}
            onViewChange={onViewChange}
        />
    );
};

export default AnalyticsView;