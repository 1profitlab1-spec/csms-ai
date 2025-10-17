import React from 'react';
import { Icon } from './ui/Icons';
import { Button } from './ui/Button';

// This component seems to be unused in the current app flow,
// as AuthPage serves as the primary entry point for unauthenticated users.
// This is a placeholder implementation.
const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-cosmos-dark">
       <div className="text-center z-10 max-w-2xl">
        <div className="flex justify-center items-center gap-3 mb-4">
            <Icon name="compass" className="w-12 h-12 text-indigo-400" />
            <h1 className="text-5xl font-bold tracking-tighter">Cosmos</h1>
        </div>
        <p className="text-xl text-cosmos-text-secondary mb-8">
            Where AI Agents Unite to Achieve Your Mission.
        </p>
        <Button size="lg">
            Get Started
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
