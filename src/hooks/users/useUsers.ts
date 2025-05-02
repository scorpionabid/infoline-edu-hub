
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSectorAdmin, sectorId } = usePermissions();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // İstifadəçiləri birbaşa database-dən əldə edək
      let query = supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          region_id,
          sector_id,
          school_id,
          profiles!user_id(
            full_name,
            email,
            phone,
            position,
            language,
            status,
            created_at,
            updated_at
          )
        `);

      // Sektor admini yalnız öz sektoruna aid istifadəçiləri görə bilər
      if (isSectorAdmin && sectorId) {
        console.log(`SectorAdmin filtering by sector: ${sectorId}`);
        query = query.eq('sector_id', sectorId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        // Verilənləri User tipinə uyğun formata çevirək
        const formattedUsers = data.map(item => {
          const profile = item.profiles || {};
          
          return {
            id: item.user_id,
            email: profile.email || '',
            full_name: profile.full_name || '',
            name: profile.full_name || '',
            role: item.role || '',
            region_id: item.region_id,
            sector_id: item.sector_id,
            school_id: item.school_id,
            phone: profile.phone || '',
            position: profile.position || '',
            language: profile.language || 'az',
            status: profile.status || 'active',
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };
        });
        
        setUsers(formattedUsers);
      }
      
    } catch (err: any) {
      console.error('Users fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSectorAdmin, sectorId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refetchUsers: fetchUsers
  };
};

export default useUsers;
