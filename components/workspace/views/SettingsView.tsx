// components/workspace/views/SettingsView.tsx
import React, { useState } from 'react';
import { User } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';
import { Icon } from '../../ui/Icons';
import toast from 'react-hot-toast';
import { AnimatedSection } from '../../ui/AnimatedSection';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { Avatar } from '../../ui/Avatar';

interface SettingsViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onDeleteAllMissions: () => void;
}

const avatars = [
    `https://i.pravatar.cc/150?u=a`,
    `https://i.pravatar.cc/150?u=b`,
    `https://i.pravatar.cc/150?u=c`,
    `https://i.pravatar.cc/150?u=d`,
    `https://i.pravatar.cc/150?u=e`,
    `https://i.pravatar.cc/150?u=f`,
];

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUserUpdate, onDeleteAllMissions }) => {
  const [jobRole, setJobRole] = useState(user.jobRole || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const updatedUser = {
      ...user,
      jobRole,
      avatarUrl: selectedAvatar,
    };
    onUserUpdate(updatedUser);
    setTimeout(() => {
        setIsSaving(false);
        toast.success("Profile updated successfully!");
    }, 1000);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    onDeleteAllMissions();
    setTimeout(() => {
        setIsDeleting(false);
        setIsModalOpen(false);
        toast.success("All mission data has been deleted.");
    }, 1500);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-transparent p-6 md:p-10">
      <AnimatedSection>
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-brand-text-secondary mt-2 text-lg">Manage your profile and application settings.</p>
      </AnimatedSection>

      <div className="mt-8 max-w-2xl space-y-8">
        <AnimatedSection style={{ animationDelay: '0.1s' }}>
            <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-brand-text-secondary mb-1">Full Name</label>
                        <Input id="fullName" value={user.name} disabled className="cursor-not-allowed opacity-70" />
                    </div>
                    <div>
                        <label htmlFor="jobRole" className="block text-sm font-medium text-brand-text-secondary mb-1">Professional Role</label>
                        <Input id="jobRole" value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. Marketing Manager" />
                    </div>
                </div>
            </Card>
        </AnimatedSection>

        <AnimatedSection style={{ animationDelay: '0.2s' }}>
            <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Avatar</h2>
                <div className="flex items-center gap-6">
                    <Avatar src={selectedAvatar} fallback={user.firstName.charAt(0)} className="w-20 h-20 text-3xl" />
                    <div className="flex flex-wrap gap-2">
                        {avatars.map(avatar => (
                            <button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`w-12 h-12 rounded-full overflow-hidden transition-all duration-200 ${selectedAvatar === avatar ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-brand-dark' : 'hover:scale-110'}`}>
                                <img src={avatar} alt="avatar option" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </Card>
        </AnimatedSection>
        
         <AnimatedSection style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} size="lg">
                    {isSaving ? <Icon name="loader" /> : 'Save All Changes'}
                </Button>
            </div>
        </AnimatedSection>

        <AnimatedSection style={{ animationDelay: '0.4s' }}>
            <Card className="p-8 border-red-500/50 bg-red-950/20">
                <h2 className="text-2xl font-bold mb-2 text-red-300">Danger Zone</h2>
                <p className="text-red-300/80 mb-4">These actions are permanent and cannot be undone.</p>
                <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
                    Delete All Mission Data
                </Button>
            </Card>
        </AnimatedSection>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description="This will permanently delete all of your missions, documents, and chat histories. This action cannot be undone."
        confirmText="Yes, delete everything"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SettingsView;