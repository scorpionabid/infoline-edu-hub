
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export interface DashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  completionRate: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    totalForms: 0,
    completedForms: 0,
    pendingForms: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(selectUser);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        let query = supabase.from('data_entries').select('status');
        
        // Apply role-based filtering
        if (user?.role === 'regionadmin' && user.region_id) {
          query = query.eq('schools.region_id', user.region_id);
        } else if (user?.role === 'sectoradmin' && user.sector_id) {
          query = query.eq('schools.sector_id', user.sector_id);
        } else if (user?.role === 'schooladmin' && user.school_id) {
          query = query.eq('school_id', user.school_id);
        }
        
        const { data: entries, error } = await query;
        
        if (error) throw error;
        
        const totalForms = entries?.length || 0;
        const completedForms = entries?.filter(entry => entry.status === 'approved').length || 0;
        const pendingForms = entries?.filter(entry => entry.status === 'pending').length || 0;
        const completionRate = totalForms > 0 ? (completedForms / totalForms) * 100 : 0;
        
        setData({
          totalForms,
          completedForms,
          pendingForms,
          completionRate: Math.round(completionRate * 100) / 100
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  return {
    data,
    loading,
    refreshData: () => {
      if (user) {
        setLoading(true);
        // Re-trigger the effect
      }
    }
  };
}

export default useDashboardData;
