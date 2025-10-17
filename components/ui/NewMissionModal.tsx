import React, { useState, useEffect } from 'react';
import { User, Mission } from '../../types';
import { Icon } from './Icons';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';

interface NewMissionModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (missionData: Omit<Mission, 'id' | 'document' | 'agents' | 'huddleMessages'>) => void;
  isLoading: boolean;
  initialData?: {
      title: string;
      details: string;
      jobRole: string;
      justification?: string;
  }
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({ user, onClose, onSubmit, isLoading, initialData }) => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [jobRole, setJobRole] = useState(user.jobRole || '');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDetails(initialData.details);
            setJobRole(initialData.jobRole);
        }
    }, [initialData]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !jobRole.trim()) return;
        onSubmit({ title, details, jobRole });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="glassmorphism w-full max-w-lg rounded-xl p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">{initialData ? "Proactive Mission" : "New Mission"}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><Icon name="x"/></Button>
                </div>

                {initialData?.justification && (
                    <div className="bg-purple-950/50 border border-purple-800 p-3 rounded-md mb-4 text-sm text-purple-200 flex items-start gap-3">
                        <Icon name="lightbulb" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p><span className="font-semibold">Oracle's Justification:</span> {initialData.justification}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="mission-title" className="text-sm font-medium text-brand-text-secondary mb-1 block">Topic / Problem</label>
                        <Input id="mission-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Q4 Marketing Strategy" required disabled={isLoading} />
                    </div>
                     <div>
                        <label htmlFor="job-role" className="text-sm font-medium text-brand-text-secondary mb-1 block">Your Role</label>
                        <Input id="job-role" value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g., Marketing Manager" required disabled={isLoading} />
                    </div>
                    <div>
                        <label htmlFor="mission-details" className="text-sm font-medium text-brand-text-secondary mb-1 block">Describe the problem in details (Optional)</label>
                        <Textarea id="mission-details" value={details} onChange={e => setDetails(e.target.value)} placeholder="Provide context, goals, and constraints..." rows={5} disabled={isLoading} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading || !title.trim() || !jobRole.trim()}>
                            {isLoading ? <Icon name="loader" /> : 'Assemble Squad & Launch'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};