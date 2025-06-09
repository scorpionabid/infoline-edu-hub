
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';

export const useUserData = (userId?: string) => {
  const [userData, setUserData] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use proper table aliases to avoid ambiguous joins
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles!inner(
              role,
              region_id,
              sector_id,
              school_id,
              regions:region_id(name),
              sectors:sector_id(name),
              schools:school_id(name)
            )
          `)
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          const userRole = data.user_roles as any;
          
          const fullUserData: FullUserData = {
            id: data.id,
            fullName: data.full_name || '',
            full_name: data.full_name,
            email: data.email,
            role: userRole?.role || 'user',
            status: data.status || 'active',
            phone: data.phone,
            language: data.language,
            position: data.position,
            avatar: data.avatar,
            created_at: data.created_at,
            updated_at: data.updated_at,
            last_login: data.last_login,
            region_id: userRole?.region_id,
            sector_id: userRole?.sector_id,
            school_id: userRole?.school_id,
            entityName: {
              region: userRole?.regions?.name || '',
              sector: userRole?.sectors?.name || '',
              school: userRole?.schools?.name || ''
            }
          };

          setUserData(fullUserData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const updateUserData = async (updates: Partial<FullUserData>) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName || updates.full_name,
          email: updates.email,
          phone: updates.phone,
          position: updates.position,
          language: updates.language,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUserData(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating user data:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            role,
            region_id,
            sector_id,
            school_id
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const userRole = data.user_roles as any;
        
        const refreshedData: FullUserData = {
          id: data.id,
          fullName: data.full_name || '',
          full_name: data.full_name,
          email: data.email,
          role: userRole?.role || 'user',
          status: data.status,
          phone: data.phone,
          language: data.language,
          position: data.position,
          created_at: data.created_at,
          updated_at: data.updated_at,
          region_id: userRole?.region_id,
          sector_id: userRole?.sector_id,
          school_id: userRole?.school_id
        };

        setUserData(refreshedData);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    loading,
    error,
    updateUserData,
    refreshUserData
  };
};

export default useUserData;
