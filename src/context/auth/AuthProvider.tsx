
import React, { useMemo } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from './types';

// Hook'larımızı import edirik
import { useAuthState } from './hooks/useAuthState';
import { useAuthCache } from './hooks/useAuthCache';
import { useAuthFetch } from './hooks/useAuthFetch';
import { useAuthOperations } from './hooks/useAuthOperations';
import { useAuthListeners } from './hooks/useAuthListeners';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state'ləri və referansları
  const {
    user,
    setUser,
    session,
    setSession,
    error,
    setError,
    authState,
    setAuthState,
    lastFetchedUserId,
    lastFetchTime,
    authSubscription,
    debounceTimer,
    fetchingUserData,
    fetchAbortController,
    fetchTimeoutTimer,
    authListenerInitialized
  } = useAuthState();

  // Keş və loqlama funksiyaları
  const {
    getCachedUser,
    setCachedUser,
    shouldLogAuthStateChange,
  } = useAuthCache();

  // İstifadəçi məlumatlarını əldə etmə funksiyaları
  const {
    fetchUserData,
    cancelPreviousFetch,
  } = useAuthFetch(
    setCachedUser, 
    lastFetchedUserId, 
    lastFetchTime, 
    fetchingUserData, 
    fetchAbortController, 
    fetchTimeoutTimer
  );

  // Auth əməliyyatları (login, logout, update, create)
  const {
    login,
    logout,
    updateUser,
    createUser,
    signIn,
    signOut,
    refreshProfile,
    clearError
  } = useAuthOperations(
    setUser,
    setSession,
    setError,
    setAuthState,
    (session, forceRefresh) => fetchUserData(
      session, 
      forceRefresh,
      setUser,
      setAuthState,
      setError,
      user
    ),
    setCachedUser,
    cancelPreviousFetch,
    user,
    session
  );

  // Auth dinləyiciləri və sessiya kontrolü
  useAuthListeners(
    authListenerInitialized,
    debounceTimer,
    authSubscription,
    (session, forceRefresh) => fetchUserData(
      session, 
      forceRefresh,
      setUser,
      setAuthState,
      setError,
      user
    ),
    getCachedUser,
    setUser,
    setSession,
    setAuthState,
    setCachedUser,
    cancelPreviousFetch,
    shouldLogAuthStateChange,
    user
  );
  
  // Context dəyəri
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    refreshProfile,
    // Legacy support
    signIn,
    signOut,
    createUser
  }), [
    user, 
    session, 
    authState.isAuthenticated, 
    authState.isLoading, 
    error, 
    login, 
    logout, 
    updateUser, 
    clearError,
    refreshProfile,
    signIn,
    signOut,
    createUser
  ]);

  // Auth Provider-ı təqdim edirik
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
