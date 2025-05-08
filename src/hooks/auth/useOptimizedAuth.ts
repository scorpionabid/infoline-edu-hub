import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from './useAuthStore';
import { FullUserData } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

const useOptimizedAuth = () => {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    error, 
    setUser, 
    setAuthenticated, 
    setLoading, 
    setError, 
    clear 
  } = useAuthStore();
  const [session, setSession] = useState<any>(null);

  // Load initial session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data?.session) {
          setSession(data.session);
          setAuthenticated(true);
          
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
        setSession(session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setAuthenticated(true);
          
          if (session?.user) {
            fetchUserData(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          clear();
          setLoading(false);
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
        ? data.user_roles[0]?.role as UserRole || 'user'
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
        full_name: data.full_name,
        phone: data.phone,
        role: role,
        region_id: region_id,
        regionId: region_id,
        sector_id: sector_id,
        sectorId: sector_id,
        school_id: school_id,
        schoolId: school_id,
        position: data.position,
        avatar: data.avatar,
        language: data.language || 'az',
        status: (profileData?.status as UserStatus) || 'active',
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setUser(userData);
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatUserData = (userData: any): FullUserData => {
    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name || userData.user_metadata?.full_name,
      avatar: userData.avatar,
      role: userData.role,
      status: userData.status,
      language: userData.language,
      region_id: userData.region_id,
      regionId: userData.region_id,
      sector_id: userData.sector_id,
      sectorId: userData.sector_id,
      school_id: userData.school_id,
      schoolId: userData.school_id,
      phone: userData.phone,
      position: userData.position,
      last_login: userData.last_login,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      notificationSettings: userData.notification_settings
    };
  };

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
