import React, { useState } from 'react';
import { Mission, User, Agent } from '../../types';
import OnboardingMissionPage from '../onboarding/OnboardingMissionPage';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icons';
import { AnimatedSection } from '../ui/AnimatedSection';

interface OnboardingPageProps {
  user: User;
  onComplete: (mission: Mission) => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const [mission, setMission] = useState<Mission | null>(null);

  const handleMissionStart = (startedMission: Mission) => {
    setMission(startedMission);
  };

  if (!mission) {
    return <OnboardingMissionPage onMissionStart={handleMissionStart} />;
  }

  // This part shows the agents and completes onboarding
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <div className="text-center max-w-3xl z-10">
        <AnimatedSection>
          <Icon name="sparkles" className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Your Agent Squad is Assembled!</h1>
          <p className="text-xl text-brand-text-secondary mb-8">
            Based on your mission, I've selected the perfect team of AI agents to help you, {user.firstName}.
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {mission.agents.map((agent: Agent, index: number) => (
             <AnimatedSection key={agent.name} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <Card className="flex flex-col items-center text-center p-6 h-full">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 bg-purple-900/50`}>
                        <Icon name={agent.icon} className={`w-7 h-7 ${agent.color}`} />
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-1">{agent.name}</h2>
                    <p className="text-sm text-brand-text-secondary flex-grow">{agent.role}</p>
                </Card>
            </AnimatedSection>
          ))}
        </div>
        
        <AnimatedSection style={{ animationDelay: `${0.2 + mission.agents.length * 0.1}s` }}>
            {/* FIX: Pass mission data back to parent */}
            <Button size="lg" onClick={() => onComplete(mission)}>
                Enter Your Workspace
            </Button>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default OnboardingPage;