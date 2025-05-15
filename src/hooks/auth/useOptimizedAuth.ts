
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from './useAuthStore';
import { FullUserData, UserStatus } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, normalizeRole } from '@/types/role';

const useOptimizedAuth = () => {
  const { 
    user, 
    loading, 
    error, 
    isAuthenticated,
    setUser, 
    setSession, 
    setLoading, 
    setError,
    clearError
  } = useAuthStore();
  const [session, setLocalSession] = useState<any>(null);

  // Load initial session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data?.session) {
          setLocalSession(data.session);
          setSession(data.session);
          
          // Fetch user data if we have a session but no user
          if (!user) {
            fetchUserData(data.session.user.id);
          }
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLocalSession(session);
        setSession(session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            fetchUserData(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          clearError();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from Supabase
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      setLoading(true);

      // Fetch user profile data
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles:user_roles(role, region_id, sector_id, school_id)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Extract role info from user_roles
      const role = Array.isArray(data.user_roles) && data.user_roles.length 
        ? data.user_roles[0]?.role
        : 'user';
      
      const region_id = Array.isArray(data.user_roles) && data.user_roles.length 
        ? data.user_roles[0]?.region_id 
        : null;
      
      const sector_id = Array.isArray(data.user_roles) && data.user_roles.length 
        ? data.user_roles[0]?.sector_id 
        : null;
      
      const school_id = Array.isArray(data.user_roles) && data.user_roles.length 
        ? data.user_roles[0]?.school_id 
        : null;

      // Create the full user data
      const userData: FullUserData = {
        id: userId,
        email: data.email,
        full_name: data.full_name || '',
        phone: data.phone,
        role: normalizeRole(role),
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        position: data.position,
        avatar: data.avatar,
        language: data.language || 'az',
        status: (data.status as UserStatus) || 'active',
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Add compatibility fields
        regionId: region_id,
        sectorId: sector_id,
        schoolId: school_id,
      };

      setUser(userData);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  return {
    isAuthenticated,
    user,
    session,
    loading,
    error,
    setError,
  };
};

export default useOptimizedAuth;
