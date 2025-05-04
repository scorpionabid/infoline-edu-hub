
import { useState, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';
import { AuthErrorType } from '../types';

/**
 * Auth konteksti üçün bütün state'ləri və referansları idarə edən hook
 * @returns Auth state və referansları
 */
export const useAuthState = () => {
  // State'lər
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<AuthErrorType>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  // Referanslar
  const lastFetchedUserId = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const authSubscription = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fetchingUserData = useRef<boolean>(false);
  const fetchAbortController = useRef<AbortController | null>(null);
  const fetchTimeoutTimer = useRef<NodeJS.Timeout | null>(null);
  const authListenerInitialized = useRef<boolean>(false);

  return {
    // State'lər
    user,
    setUser,
    session,
    setSession,
    error,
    setError,
    authState,
    setAuthState,
    
    // Referanslar
    lastFetchedUserId,
    lastFetchTime,
    authSubscription,
    debounceTimer,
    fetchingUserData,
    fetchAbortController,
    fetchTimeoutTimer,
    authListenerInitialized
  };
};
