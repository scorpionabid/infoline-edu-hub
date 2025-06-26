
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { supabase } from '@/integrations/supabase/client';

export interface PermissionsSummary {
  role: string;
  restrictions: {
    region_id?: string;
    sector_id?: string;
    school_id?: string;
  };
}

export const useRoleBasedReports = () => {
  const user = useAuthStore(selectUser);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionsSummary | null>(null);

  const canAccessReportType = useCallback((reportType: string): boolean => {
    return true; // For now, allow all report types
  }, []);

  const getSchoolPerformanceReport = useCallback(async (filters: any = {}) => {
    try {
      // Mock data for now
      return [
        {
          school_id: '1',
          school_name: 'Test School',
          region_name: 'Test Region',
          sector_name: 'Test Sector',
          completion_rate: 85
        }
      ];
    } catch (err) {
      console.error('Error fetching school performance report:', err);
      return [];
    }
  }, []);

  const userId = user?.id;
  
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        setLoading(true);
        if (userId) {
          // Mock role loading
          const role = 'superadmin';
          setUserRole(role);
          
          // Set permissions directly
          setPermissions({
            role: role,
            restrictions: {}
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, [userId]); // Stable reference

  const getPermissionsSummary = useCallback((): PermissionsSummary | null => {
    return permissions;
  }, [permissions]);

  return {
    userRole,
    loading,
    error,
    canAccessReportType,
    getPermissionsSummary,
    permissions, // Direct access to permissions
    // getSchoolPerformanceReport
  };
};

