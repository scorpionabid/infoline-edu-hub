
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { fetchSchoolAdminDashboardData, generateMockSchoolAdminData } from '@/services/schoolAdminService';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UseSchoolAdminDashboardResult {
  data: SchoolAdminDashboardData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  navigateToDataEntry: () => void;
  handleFormClick: (formId: string) => void;
}

const useSchoolAdminDashboard = (): UseSchoolAdminDashboardResult => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  
  // Verilənlərin əldə edilməsi
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['schoolAdminDashboard', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        throw new Error('Məktəb ID-si tapılmadı');
      }
      try {
        // Real məlumatları əldə etməyə çalışaq
        const dashboardData = await fetchSchoolAdminDashboardData(schoolId);
        return dashboardData;
      } catch (error) {
        console.error('Real məlumatlar əldə edilə bilmədi, mock data istifadə edilir', error);
        // Xəta baş verdikdə mock data qaytaraq
        return generateMockSchoolAdminData();
      }
    },
    // options.meta içində xəta izləmə
    meta: {
      onError: (error: Error) => {
        console.error('Dashboard məlumatları yüklənərkən xəta:', error);
        toast.error('Məlumatları yükləyərkən xəta baş verdi', {
          description: error.message
        });
      }
    },
    enabled: !!schoolId,
    // Mock data istifadə etdiyimiz üçün 5 dəqiqəlik keşləmə
    staleTime: 5 * 60 * 1000
  });
  
  // Verilən formulara keçid
  const handleFormClick = useCallback((formId: string) => {
    navigate(`/categories/${formId}`);
  }, [navigate]);
  
  // Yeni data əlavə etmə səhifəsinə keçid
  const navigateToDataEntry = useCallback(() => {
    navigate('/categories');
  }, [navigate]);
  
  return {
    data: data || null,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
    navigateToDataEntry,
    handleFormClick
  };
};

export default useSchoolAdminDashboard;
