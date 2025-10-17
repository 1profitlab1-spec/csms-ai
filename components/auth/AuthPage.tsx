import React, { useState } from 'react';
import { User } from '../../types';
import { mockSignUp } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Icon } from '../ui/Icons';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const headlineText = "Where AI Agents Unite to Achieve Your Mission.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in both your name and email.');
      return;
    }
    setError('');
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      try {
        const user = mockSignUp(fullName, email);
        onLogin(user);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-white">
      <div className="text-center z-10 max-w-2xl">
        <div className="flex justify-center items-center gap-3 mb-4">
            <Icon name="compass" className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold tracking-tighter">Cosmos</h1>
        </div>
        <p className="text-xl text-brand-text-secondary mb-8 min-h-[56px]">
            {headlineText}
        </p>
      </div>

      <div className="w-full max-w-sm z-10 glassmorphism p-8 rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Get Started</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-brand-text-secondary mb-1">Full Name</label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-1">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Icon name="loader" className="animate-spin" /> : 'Continue'}
          </Button>
        </form>
        <p className="text-xs text-brand-text-secondary text-center mt-4">
            By continuing, you are entering our MVP. This is a mock sign-up.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;