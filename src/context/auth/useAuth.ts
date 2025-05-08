
import { useContext, createContext } from 'react';
import { AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = AuthContext.Provider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Make sure we provide all properties required by AuthContextType
  return {
    ...context,
    authenticated: context.isAuthenticated,
    logout: context.logout,
    logIn: context.login,
    logOut: context.logout,
    signOut: context.logout,
    loading: context.loading,
    setError: (error: string | null) => {
      if (context.clearError && typeof error === 'string') {
        context.clearError();
      }
    },
    clearError: context.clearError || (() => {}),
    refreshProfile: async (): Promise<any> => {
      await context.refreshSession();
      return context.user;
    }
  };
};

export default useAuth;
