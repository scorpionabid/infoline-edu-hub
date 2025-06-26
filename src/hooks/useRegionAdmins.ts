import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/SupabaseProvider';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface RegionAdmin {
  id: string;
  user_id: string;
  region_id: string;
  created_at: string;
  user_email?: string;
  user_full_name?: string;
}

export function useRegionAdmins(regionId?: string) {
  const [admins, setAdmins] = useState<RegionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase } = useSupabase();
  const session = useAuthStore(state => state.session);

  useEffect(() => {
    async function fetchRegionAdmins() {
      if (!session?.access_token) {
        setAdmins([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Region ID ilə filterlənmiş sorğu
        let query = supabase
          .from('user_roles')
          .select(`
            id, 
            user_id, 
            region_id, 
            created_at,
            profiles:user_id (
              email:email, 
              full_name:full_name
            )
          `)
          .eq('role', 'regionadmin');

        // Əgər regionId varsa yalnız o region üçün admins göstər
        if (regionId) {
          query = query.eq('region_id', regionId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedData = data?.map(admin => ({
          id: admin.id,
          user_id: admin.user_id,
          region_id: admin.region_id,
          created_at: admin.created_at,
          user_email: admin.profiles?.email,
          user_full_name: admin.profiles?.full_name
        })) || [];

        setAdmins(formattedData);
      } catch (err: any) {
        console.error("Region adminlərini əldə edərkən xəta:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRegionAdmins();
  }, [supabase, regionId, session?.access_token]);

  // Admin əlavə etmə funksiyası
  const addAdmin = async (userId: string, regionId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Əvvəlcə istifadəçinin regionadmin rolunda olub-olmadığını yoxla
      const { data: existingAdmin, error: existingError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', userId)
        .eq('region_id', regionId)
        .eq('role', 'regionadmin')
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingAdmin) {
        // İstifadəçi artıq bu regionun adminidir
        return existingAdmin;
      }

      // Əgər istifadəçi admin deyilsə, əlavə et
      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, region_id: regionId, role: 'regionadmin' }
        ])
        .select()
        .single();

      if (error) throw error;

      // Admin siyahısını yenilə
      setAdmins(prev => [...prev, {
        id: data.id,
        user_id: data.user_id,
        region_id: data.region_id,
        created_at: data.created_at,
        // Bu məlumatları bir az sonra əldə edəcəyik
        user_email: undefined,
        user_full_name: undefined
      }]);

      return data;
    } catch (err: any) {
      console.error("Region admini əlavə edərkən xəta:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin silmə funksiyası
  const removeAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      // Admin siyahısını yenilə
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    } catch (err: any) {
      console.error("Region adminini silərkən xəta:", err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    admins,
    loading,
    error,
    addAdmin,
    removeAdmin
  };
}
