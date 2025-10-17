
import React from 'react';
import AuthPageContent from '../auth/AuthPage';
import { User } from '../../types';

// FIX: This file was empty. Re-exporting the main implementation from /auth to resolve module errors.
interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = (props) => {
  return <AuthPageContent {...props} />;
};

export default AuthPage;
