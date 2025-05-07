
import { useContext } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from '@/types/user'; 

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Contextə authenticated xassəsini əlavə et və notificationSettings tipini uyğunlaşdır
  return {
    ...context,
    authenticated: context.isAuthenticated,
    user: context.user ? {
      ...context.user,
      notificationSettings: context.user.notificationSettings ? {
        ...context.user.notificationSettings,
        inApp: context.user.notificationSettings.push || false,
        sms: false,
        deadlineReminders: context.user.notificationSettings.deadline || false
      } : {
        email: false,
        inApp: false,
        push: false,
        system: false,
        deadline: false,
        sms: false,
        deadlineReminders: false
      }
    } : null
  };
};

// Avtorizasiya olmayan halda xəta atır
export const useAuthSafe = () => {
  const auth = useAuth();
  
  if (!auth.user && !auth.loading) { 
    throw new Error('useAuthSafe must be used within an authenticated context and after loading is complete');
  }
  
  return auth;
};
