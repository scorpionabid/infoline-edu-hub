/**
 * useAuth hook - daha modulyar və yığcam bir implementasiya
 * 
 * Bu hook, auth state və əməliyyatları üçün utils/ qovluğundakı modulları istifadə edir
 * - authTypes.ts: Tiplər və interfeyslər
 * - authState.ts: State və state dəyişdirmə funksiyaları
 * - authActions.ts: Əməliyyatlar (login, logout, refresh)
 * - preferenceUtils.ts: İstifadəçi seçimləri üçün funksiyalar
 */

import { FullUserData } from '@/types/user';
import { UseAuthResult } from './utils/authTypes';
import { useAuthState } from './utils/authState';
import { useAuthActions } from './utils/authActions';
import { useUserPreferences } from './utils/preferenceUtils';

/**
 * Birləşdirilmiş auth hook - əhatəli autentifikasiya funksionallığı təqdim edir
 * 
 * Bu hook, daha kiçik, ixtisaslaşdırılmış modullardan istifadə edir və onları birgə çalışdırır
 */
export const useAuth = (): UseAuthResult => {
  // Auth state - vəziyyət və vəziyyət dəyişdirmə funksiyaları
  const {
    user, setUser,
    session, setSession,
    isAuthenticated, setIsAuthenticated,
    isLoading, setIsLoading,
    error, setError,
    state
  } = useAuthState();
  
  // Auth actions - əməliyyatlar
  const {
    login, 
    logout,
    refreshSession,
    refreshUserData,
    clearError
  } = useAuthActions(
    state,
    setUser,
    setSession,
    setIsAuthenticated,
    setIsLoading,
    setError
  );
  
  // User preferences - istifadəçi seçimləri funksiyaları
  const { updateUserPreferences } = useUserPreferences(user, setUser);
  
  // Yığcam olması üçün köməkçi updateUser funksiyaları
  const updateUserHelper = (userData: Partial<FullUserData>) => {
    setUser({...user, ...userData} as FullUserData);
  };

  return {
    // Basic state
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    authInitialized: state.authInitialized,
    
    // Core actions
    login,
    logout,
    refreshSession,
    refreshUserData,
    clearError,
    updateUserPreferences,
    
    // Legacy compatibility aliases
    authenticated: isAuthenticated,
    loading: isLoading,
    logIn: login,
    logOut: logout,
    signOut: logout,
    updateProfile: updateUserHelper,
    updateUserProfile: updateUserHelper,
    updateUserData: updateUserHelper
  };
};

// Re-export types for convenience
export type { UseAuthResult } from './utils/authTypes';

export default useAuth;
