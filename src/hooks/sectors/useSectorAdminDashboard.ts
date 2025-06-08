
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

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
  const user = useAuthStore(selectUser);
  const { t } = useLanguage();
  
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

  // Sektor admininin sektorundakı məktəbləri əldə et
  const fetchSectorSchools = useCallback(async () => {
    if (!user) return;
    
    try {
      setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Admininin sektorunu əldə et
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('sector_id')
        .eq('user_id', user.id)
        .eq('role', 'sectoradmin')
        .single();
      
      if (userRolesError) throw userRolesError;
      
      if (!userRoles?.sector_id) {
        throw new Error(t('No sector assigned to this admin'));
      }
      
      // Sektordakı məktəbləri əldə et
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', userRoles.sector_id);
      
      if (schoolsError) throw schoolsError;
      
      // Məktəblərin tamamlanma dərəcəsini hesabla
      // Bu mərhələdə həqiqi məlumatlar olmadığı üçün təsadüfi dəyərlər yaradırıq
      const schoolsWithCompletion: SectorSchool[] = schools.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        status: getSchoolStatus(Math.random()),
        completionRate: Math.floor(Math.random() * 100)
      }));
      
      // Təsdiq gözləyən formları əldə et
      const { data: pendingApprovals, error: approvalsError } = await supabase
        .from('data_entries')
        .select(`
          id,
          school_id,
          schools:school_id(name),
          category_id,
          categories:category_id(name),
          updated_at,
          status
        `)
        .eq('status', 'pending')
        .in('school_id', schools.map(s => s.id));
      
      if (approvalsError) throw approvalsError;
      
      // Pending approvals formatını dəyiş
      const formattedApprovals: PendingApproval[] = pendingApprovals.map(approval => ({
        id: approval.id,
        schoolId: approval.school_id,
        schoolName: approval.schools?.name || 'Unknown School',
        categoryId: approval.category_id,
        categoryName: approval.categories?.name || 'Unknown Category',
        submittedAt: approval.updated_at,
        status: approval.status
      }));
      
      // Statistikaları hesabla
      const totalSchools = schoolsWithCompletion.length;
      const completedSchools = schoolsWithCompletion.filter(s => s.status === 'completed').length;
      const pendingSchools = schoolsWithCompletion.filter(s => s.status === 'in-progress').length;
      const notStartedSchools = schoolsWithCompletion.filter(s => s.status === 'not-started').length;
      
      setDashboardData({
        schools: schoolsWithCompletion,
        pendingApprovals: formattedApprovals,
        totalSchools,
        completedSchools,
        pendingSchools,
        notStartedSchools,
        isLoading: false,
        error: null
      });
    } catch (err: any) {
      console.error('Error fetching sector admin dashboard data:', err);
      setDashboardData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || t('Failed to load dashboard data')
      }));
      toast.error(err.message || t('Failed to load dashboard data'));
    }
  }, [user, t]);
  
  // Məktəbin statusunu tamamlanma dərəcəsinə görə təyin et
  const getSchoolStatus = (completionRate: number): string => {
    if (completionRate >= 0.9) return 'completed';
    if (completionRate > 0) return 'in-progress';
    return 'not-started';
  };
  
  // Formu təsdiq et
  const approveForm = useCallback(async (formId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ status: 'approved' })
        .eq('id', formId);
      
      if (error) throw error;
      
      setDashboardData(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals.filter(a => a.id !== formId)
      }));
      
      toast.success(t('Form Approved'));
    } catch (err: any) {
      console.error('Error approving form:', err);
      toast.error(err.message || t('Failed to approve form'));
    }
  }, [t]);
  
  // Formu rədd et
  const rejectForm = useCallback(async (formId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', formId);
      
      if (error) throw error;
      
      setDashboardData(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals.filter(a => a.id !== formId)
      }));
      
      toast.success(t('Form Rejected'));
    } catch (err: any) {
      console.error('Error rejecting form:', err);
      toast.error(err.message || t('Failed to reject form'));
    }
  }, [t]);
  
  // Məlumatları yenilə
  const refreshData = useCallback(() => {
    fetchSectorSchools();
  }, [fetchSectorSchools]);
  
  // İlkin yükləmə
  useEffect(() => {
    fetchSectorSchools();
  }, [fetchSectorSchools]);
  
  return {
    ...dashboardData,
    approveForm,
    rejectForm,
    refreshData
  };
};

export default useSectorAdminDashboard;
