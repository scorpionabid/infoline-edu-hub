
import { Role } from './types';
import { useAuth } from './useAuth';

// Helper hook to check for specific role
export const useRole = (role: Role | Role[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as Role);
  }
  
  return user.role === role;
};
