import React, { useState } from 'react';
import { Mission } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Icon } from '../ui/Icons';
import { cosmosOrchestrator } from '../../services/geminiService';
import { Card } from '../ui/Card';
import { AnimatedSection } from '../ui/AnimatedSection';

interface OnboardingMissionPageProps {
  onMissionStart: (mission: Mission) => void;
}

const defaultRoles = ["Entrepreneur", "Marketer", "Developer", "Designer", "Student"];

const OnboardingMissionPage: React.FC<OnboardingMissionPageProps> = ({ onMissionStart }) => {
  const [missionName, setMissionName] = useState('');
  const [details, setDetails] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const headlineText = "Let's define your first mission.";

  const handleRoleSelect = (role: string) => {
    if (role === 'Other') {
      setSelectedRole('Other');
      setShowCustomRoleInput(true);
    } else {
      setSelectedRole(role);
      setShowCustomRoleInput(false);
      setCustomRole('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalJobRole = selectedRole === 'Other' ? customRole : selectedRole;

    if (!missionName.trim() || !finalJobRole.trim()) {
      setError('Please provide a Mission Name and select your role.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const agents = await cosmosOrchestrator(missionName, details, finalJobRole);
      if(agents.length === 0) {
        throw new Error("Could not assemble an agent team. Please try refining your mission.");
      }
      onMissionStart({
        id: `mission-${Date.now()}`,
        title: missionName,
        details,
        jobRole: finalJobRole,
        agents,
        document: [{
          id: `section-${Date.now()}`,
          content: `# ${missionName}\n\nThis is the beginning of your new mission document. You can click here to start editing.`,
        }],
        huddleMessages: [],
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while assembling your team.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-fade-in">
      <div className="w-full max-w-2xl z-10 text-center">
        <AnimatedSection>
            <Icon name="compass" className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-8 min-h-[50px]">{headlineText}</h1>
        </AnimatedSection>
        
        <AnimatedSection style={{animationDelay: '0.2s'}}>
            <Card className="text-left p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="missionName" className="block text-sm font-medium text-brand-text-secondary">Mission Name</label>
                        <span className={`text-xs ${missionName.length > 100 ? 'text-red-400' : 'text-brand-text-secondary'}`}>
                            {missionName.length} / 100
                        </span>
                    </div>
                    <Input
                    id="missionName"
                    placeholder="e.g., Launch a new sustainable sneaker brand"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    maxLength={100}
                    disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-brand-text-secondary mb-1">Mission Specifications (Optional)</label>
                    <Textarea
                    id="details"
                    placeholder="e.g., Target audience is millennials, focus on sustainability, initial launch on Instagram..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">What is your role?</label>
                    <div className="flex flex-wrap gap-2">
                        {defaultRoles.map(role => (
                            <Button
                                key={role}
                                type="button"
                                variant={selectedRole === role ? 'default' : 'secondary'}
                                onClick={() => handleRoleSelect(role)}
                                disabled={isLoading}
                            >
                                {role}
                            </Button>
                        ))}
                        <Button
                            type="button"
                            variant={selectedRole === 'Other' ? 'default' : 'secondary'}
                            onClick={() => handleRoleSelect('Other')}
                            disabled={isLoading}
                        >
                            Other
                        </Button>
                    </div>
                     {showCustomRoleInput && (
                        <div className="mt-3 animate-fade-in">
                            <Input
                                placeholder="Please specify your role"
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
                {error && <p className="text-red-400 text-sm text-center pt-2">{error}</p>}
                </form>
            </Card>
        </AnimatedSection>

        <AnimatedSection className="mt-8" style={{animationDelay: '0.4s'}}>
             <Button 
                type="submit" 
                size="lg" 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="w-auto px-12 h-14 text-lg shadow-[0_0_15px_rgba(192,132,252,0.2)] hover:shadow-[0_0_25px_rgba(192,132,252,0.3)] transition-shadow"
            >
                {isLoading ? <Icon name="loader" className="animate-spin h-6 w-6" /> : "Assemble Squad"}
            </Button>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default OnboardingMissionPage;