import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  CategoryItem,
  DeadlineItem,
  FormItem,
  SchoolStat,
  PendingApproval,
  SectorStat
} from '@/types/dashboard';
import { UserRole } from '@/types/supabase';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const getDashboardData = async (userRole: UserRole) => {
    if (!user) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      // Different data for different roles
      if (userRole === 'superadmin') {
        return await fetchSuperAdminData();
      } else if (userRole === 'regionadmin' && user.region_id) {
        return await fetchRegionAdminData(user.region_id);
      } else if (userRole === 'sectoradmin' && user.sector_id) {
        return await fetchSectorAdminData(user.sector_id);
      } else if (userRole === 'schooladmin' && user.school_id) {
        return await fetchSchoolAdminData(user.school_id);
      } else {
        throw new Error('Invalid user role or missing entity ID');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
      setLoading(false);
      return null;
    }
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRole = user.role;

        // Different data for different roles
        if (userRole === 'superadmin') {
          const data = await fetchSuperAdminData();
          setDashboardData(data);
        } else if (userRole === 'regionadmin' && user.region_id) {
          const data = await fetchRegionAdminData(user.region_id);
          setDashboardData(data);
        } else if (userRole === 'sectoradmin' && user.sector_id) {
          const data = await fetchSectorAdminData(user.sector_id);
          setDashboardData(data);
        } else if (userRole === 'schooladmin' && user.school_id) {
          const data = await fetchSchoolAdminData(user.school_id);
          setDashboardData(data);
        } else {
          throw new Error('Invalid user role or missing entity ID');
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    // Mock data for super admin
    return {
      users: {
        active: 200,
        total: 250,
        new: 20
      },
      regionCount: 25,
      sectorCount: 75,
      schoolCount: 250,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active', completion: 0.85 },
        { id: '2', name: 'Teacher Information', status: 'active', completion: 0.72 },
        { id: '3', name: 'Infrastructure', status: 'active', completion: 0.64 },
        { id: '4', name: 'Student Assessment', status: 'active', completion: 0.58 },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School A', sectorName: 'Sector 1', regionName: 'Region A', categoryName: 'General Statistics', date: '2023-05-01' },
        { id: '2', schoolName: 'School B', sectorName: 'Sector 2', regionName: 'Region B', categoryName: 'Teacher Information', date: '2023-05-02' },
        { id: '3', schoolName: 'School C', sectorName: 'Sector 3', regionName: 'Region C', categoryName: 'Infrastructure', date: '2023-05-03' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
        { id: '2', name: 'Teacher Information', dueDate: '2023-06-15', status: 'active' },
        { id: '3', name: 'Infrastructure', dueDate: '2023-07-01', status: 'active' },
      ],
      regionStats: [
        { id: '1', name: 'Region A', schoolCount: 50, completionRate: 0.78 },
        { id: '2', name: 'Region B', schoolCount: 45, completionRate: 0.65 },
        { id: '3', name: 'Region C', schoolCount: 35, completionRate: 0.72 },
        { id: '4', name: 'Region D', schoolCount: 60, completionRate: 0.56 },
        { id: '5', name: 'Region E', schoolCount: 40, completionRate: 0.81 },
      ]
    };
  };

  const fetchRegionAdminData = async (regionId: string): Promise<RegionAdminDashboardData> => {
    // Mock data for region admin
    return {
      sectorCount: 8,
      schoolCount: 75,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active', completion: 0.82 },
        { id: '2', name: 'Teacher Information', status: 'active', completion: 0.68 },
        { id: '3', name: 'Infrastructure', status: 'active', completion: 0.61 },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School X', sectorName: 'Sector A', categoryName: 'General Statistics', date: '2023-05-01' },
        { id: '2', schoolName: 'School Y', sectorName: 'Sector B', categoryName: 'Teacher Information', date: '2023-05-02' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
        { id: '2', name: 'Teacher Information', dueDate: '2023-06-15', status: 'active' },
      ],
      sectorStats: [
        { id: '1', name: 'Sector A', schoolCount: 15, completionRate: 0.75 },
        { id: '2', name: 'Sector B', schoolCount: 12, completionRate: 0.68 },
        { id: '3', name: 'Sector C', schoolCount: 10, completionRate: 0.82 },
        { id: '4', name: 'Sector D', schoolCount: 18, completionRate: 0.59 },
        { id: '5', name: 'Sector E', schoolCount: 20, completionRate: 0.73 },
      ]
    };
  };

  const fetchSectorAdminData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
    // Mock data for sector admin
    return {
      schoolCount: 20,
      categories: [
        { id: '1', name: 'General Statistics', status: 'active', completion: 0.85 },
        { id: '2', name: 'Teacher Information', status: 'active', completion: 0.72 },
        { id: '3', name: 'Infrastructure', status: 'active', completion: 0.64 },
      ],
      pendingApprovals: [
        { id: '1', schoolName: 'School 1', categoryName: 'General Statistics', date: '2023-05-01' },
        { id: '2', schoolName: 'School 2', categoryName: 'Teacher Information', date: '2023-05-02' },
      ],
      deadlines: [
        { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
        { id: '2', name: 'Teacher Information', dueDate: '2023-06-15', status: 'active' },
      ],
      schoolStats: [
        { id: '1', name: 'School 1', completionRate: 0.92 },
        { id: '2', name: 'School 2', completionRate: 0.78 },
        { id: '3', name: 'School 3', completionRate: 0.65 },
        { id: '4', name: 'School 4', completionRate: 0.88 },
        { id: '5', name: 'School 5', completionRate: 0.75 },
      ]
    };
  };

  const fetchSchoolAdminData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
    try {
      // Əsl verilənlər üçün Supabase sorğuları
      
      // 1. Məktəb haqqında məlumatlar
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, address, status')
        .eq('id', schoolId)
        .single();
      
      if (schoolError) throw schoolError;
      
      // 2. Kateqoriyalar və tamamlanma məlumatları
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, status');
      
      if (categoriesError) throw categoriesError;
      
      // Təsdiqlənmə statusları
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('approvals')
        .select('category_id, status')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      
      if (approvalsError) throw approvalsError;
      
      // 3. Daxil edilmiş məlumatlar üçün statistika
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('category_id, column_id, value')
        .eq('school_id', schoolId);
      
      if (entriesError) throw entriesError;
      
      // 4. Son tarixlər
      const { data: deadlinesData, error: deadlinesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .order('deadline', { ascending: true });
      
      if (deadlinesError) throw deadlinesError;
      
      // Verilənləri formatlaşdır
      const categories: CategoryItem[] = categoriesData.map((category: any) => {
        // Bu kateqoriya üçün daxil edilən sütunların sayı
        const entriesForCategory = entriesData.filter((entry: any) => entry.category_id === category.id);
        
        // Ən son təsdiqlənmə statusu
        const latestApproval = approvalsData
          .filter((approval: any) => approval.category_id === category.id)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        // Qiymətləndirmə qaydaları burada çox sadələşdirilib
        let completion = 0;
        if (entriesForCategory.length > 0) {
          // Kateqoriya üzrə daxil edilmiş sütunların sayına əsasən hesablanır
          completion = Math.min(1, entriesForCategory.length / 10);
        }
        
        return {
          id: category.id,
          name: category.name,
          status: latestApproval?.status || 'pending',
          completion
        };
      });
      
      const deadlines: DeadlineItem[] = deadlinesData.map((deadline: any) => ({
        id: deadline.id,
        name: deadline.name,
        dueDate: deadline.deadline,
        status: deadline.status
      }));
      
      // Formalar
      const forms: FormItem[] = categories.map((category) => ({
        id: category.id,
        name: category.name,
        status: category.status
      }));
      
      return {
        schoolName: schoolData.name,
        categories,
        deadlines,
        forms
      };
    } catch (error) {
      console.error('Error fetching school admin dashboard data:', error);
      
      // Xəta halında sadə demo verilənlər göstəririk
      return {
        schoolName: 'Demo School',
        categories: [
          { id: '1', name: 'General Statistics', status: 'approved', completion: 1.0 },
          { id: '2', name: 'Teacher Information', status: 'pending', completion: 0.7 },
          { id: '3', name: 'Infrastructure', status: 'rejected', completion: 0.4 },
        ],
        deadlines: [
          { id: '1', name: 'General Statistics', dueDate: '2023-06-01', status: 'active' },
          { id: '2', name: 'Teacher Information', dueDate: '2023-06-15', status: 'active' },
        ],
        forms: [
          { id: '1', name: 'General Statistics', status: 'completed' },
          { id: '2', name: 'Teacher Information', status: 'in_progress' },
          { id: '3', name: 'Infrastructure', status: 'not_started' },
        ]
      };
    }
  };

  return {
    loading,
    error,
    dashboardData,
    getDashboardData
  };
};

export default useRealDashboardData;
