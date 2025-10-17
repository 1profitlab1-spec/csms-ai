import React from 'react';
import CommunityDirectMessagesPage from '../community/DirectMessagesPage';
import { User } from '../../types';

// This is a wrapper/re-export component.
interface DirectMessagesPageProps {
  user: User;
}

const DirectMessagesPage: React.FC<DirectMessagesPageProps> = (props) => {
  return <CommunityDirectMessagesPage {...props} />;
};

export default DirectMessagesPage;
