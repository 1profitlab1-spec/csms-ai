import { User } from '../types';

const USER_KEY = 'cosmos_mock_user';

// In a real app, this would interact with a backend like Supabase.
// For the MVP, we use localStorage.

export const mockSignUp = (fullName: string, email: string): User => {
  if (!fullName || !email) {
    throw new Error('Full name and email are required.');
  }

  const user: User = {
    id: `user-${Date.now()}`,
    name: fullName,
    firstName: fullName.split(' ')[0],
    email: email,
    isNewUser: true, // User is new, trigger onboarding
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getMockUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return null;
  }
  const user = JSON.parse(userJson) as User;
  
  // The isNewUser flag is managed by the app logic now, 
  // but we can default existing users to not be new.
  if (user.isNewUser === undefined) {
      user.isNewUser = false;
  }

  return user;
};

export const updateMockUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearMockUser = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.clear(); // Clear all user-related data on logout
};
