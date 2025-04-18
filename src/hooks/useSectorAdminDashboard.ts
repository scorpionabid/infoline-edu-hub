import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export interface SectorSchool {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  completionRate: number;
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: string;
}

export interface SectorAdminDashboardData {
  schools: SectorSchool[];
  pendingApprovals: PendingApproval[];
  totalSchools: number;
  completedSchools: number;
  pendingSchools: number;
  notStartedSchools: number;
  isLoading: boolean;
  error: string | null;
}

export const useSectorAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<SectorAdminDashboardData>({
    schools: [],
    pendingApprovals: [],
    totalSchools: 0,
    completedSchools: 0,
    pendingSchools: 0,
    notStartedSchools: 0,
    isLoading: true,
    error: null
  });
  
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Cari sessiya məlumatlarını alırıq
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Edge Function-u çağıraraq dashboard məlumatlarını alırıq
      const { data, error } = await supabase.functions.invoke('get-sector-dashboard-data', {
        headers: {
          Authorization: `Bearer ${sessionData?.session?.access_token}`
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setDashboardData({
          schools: data.schools || [],
          pendingApprovals: data.pendingApprovals || [],
          totalSchools: data.totalSchools || 0,
          completedSchools: data.completedSchools || 0,
          pendingSchools: data.pendingSchools || 0,
          notStartedSchools: data.notStartedSchools || 0,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Sektor admin dashboard məlumatları alınarkən xəta:', error);
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Dashboard məlumatları alınarkən xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.'
      }));
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorFetchingDashboardData')
      });
    }
  }, [user, t, toast]);
  
  const approveEntries = async (schoolId: string, categoryId: string, entryIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-approve-entries', {
        body: {
          schoolId,
          categoryId,
          action: 'approve',
          entryIds
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('success'),
        description: t('dataApprovedSuccessfully')
      });
      
      // Dashboard məlumatlarını yeniləyirik
      fetchDashboardData();
      
      return { success: true };
    } catch (error) {
      console.error('Məlumatlar təsdiqlənərkən xəta:', error);
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorApprovingData')
      });
      
      return { success: false, error };
    }
  };
  
  const rejectEntries = async (schoolId: string, categoryId: string, entryIds: string[], reason: string) => {
    try {
      if (!reason) {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: t('rejectionReasonRequired')
        });
        return { success: false };
      }
      
      const { data, error } = await supabase.functions.invoke('bulk-approve-entries', {
        body: {
          schoolId,
          categoryId,
          action: 'reject',
          reason,
          entryIds
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('success'),
        description: t('dataRejectedSuccessfully')
      });
      
      // Dashboard məlumatlarını yeniləyirik
      fetchDashboardData();
      
      return { success: true };
    } catch (error) {
      console.error('Məlumatlar rədd edilərkən xəta:', error);
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorRejectingData')
      });
      
      return { success: false, error };
    }
  };
  
  const viewEntryDetails = async (schoolId: string, categoryId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-entry-details', {
        body: {
          schoolId,
          categoryId
        }
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Məlumat detalları alınarkən xəta:', error);
      
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorFetchingEntryDetails')
      });
      
      return { success: false, error };
    }
  };
  
  // İlk yükləmə və user dəyişdikdə məlumatları yeniləyirik
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);
  
  // Real-time yeniləmələri dinləyirik
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('sector-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'data_entries' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDashboardData]);
  
  return {
    ...dashboardData,
    refreshData: fetchDashboardData,
    approveEntries,
    rejectEntries,
    viewEntryDetails
  };
};