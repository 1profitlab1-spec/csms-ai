
import React from 'react';
// FIX: The component was refactored to components/onboarding. Pointing to the correct file.
import OnboardingMissionPage from './onboarding/OnboardingMissionPage';
import { Mission } from '../types';

interface MissionInputPageProps {
  onMissionStart: (mission: Mission) => void;
}
// This component is likely deprecated in favor of OnboardingMissionPage.
// Forwarding props to maintain compatibility.
const MissionInputPage: React.FC<MissionInputPageProps> = (props) => {
  return <OnboardingMissionPage {...props} />;
};

export default MissionInputPage;
