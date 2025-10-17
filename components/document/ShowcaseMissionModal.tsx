// components/document/ShowcaseMissionModal.tsx
import React, { useState, useEffect } from 'react';
import { User, Mission } from '../../types';
import { Icon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { summarizeMissionForShowcase } from '../../services/geminiService';
import { createMissionShowcasePost } from '../../services/communityService';
import toast from 'react-hot-toast';

interface ShowcaseMissionModalProps {
  user: User;
  mission: Mission;
  onClose: () => void;
}

const ShowcaseMissionModal: React.FC<ShowcaseMissionModalProps> = ({ user, mission, onClose }) => {
    const [summary, setSummary] = useState('');
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const generateSummary = async () => {
            setIsLoading(true);
            try {
                const result = await summarizeMissionForShowcase(mission);
                setTitle(result.title);
                setSummary(result.summary);
            } catch (error) {
                console.error("Failed to generate summary", error);
                toast.error("Could not generate summary.");
                setTitle(mission.title);
                setSummary("I successfully completed my mission!");
            } finally {
                setIsLoading(false);
            }
        };
        generateSummary();
    }, [mission]);
    
    const handlePost = async () => {
        setIsPosting(true);
        try {
            await createMissionShowcasePost(
                { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
                { missionTitle: title, summary, squad: mission.agents }
            );
            toast.success("Mission showcased successfully!");
            onClose();
        } catch(error) {
            toast.error("Failed to showcase mission.");
            console.error(error);
        } finally {
            setIsPosting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="glassmorphism w-full max-w-lg rounded-xl p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Showcase Mission</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><Icon name="x"/></Button>
                </div>
                
                {isLoading ? (
                    <div className="text-center py-10">
                        <Icon name="loader" className="w-8 h-8 mx-auto mb-3" />
                        <p className="text-brand-text-secondary">Oracle is summarizing your success...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-brand-text-secondary mb-1 block">Showcase Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 bg-brand-medium border border-brand-border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-brand-text-secondary mb-1 block">Summary</label>
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} className="w-full mt-1 bg-brand-medium border border-brand-border rounded-md p-2" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-brand-text-secondary mb-2 block">Agent Squad</p>
                            <div className="flex items-center -space-x-2">
                                {mission.agents.map(agent => (
                                    <div key={agent.name} className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-dark border-2 border-brand-medium" title={agent.name}>
                                        <Icon name={agent.icon} className={`w-5 h-5 ${agent.color}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex justify-end gap-3 pt-4 mt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading || isPosting}>Cancel</Button>
                    <Button onClick={handlePost} disabled={isLoading || isPosting}>
                        {isPosting ? <Icon name="loader" /> : 'Post to Nexus'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseMissionModal;
