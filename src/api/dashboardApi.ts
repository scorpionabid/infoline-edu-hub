
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardParams {
  userRole?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

interface DashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  activeSectors?: number;
  activeSchools?: number;
  incompleteSchools?: number;
  totalForms?: number;
  approvedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
  incompleteForms?: number;
  draftForms?: number;
  completionRate: number;
  categories?: any[];
}

export const fetchDashboardData = async ({ 
  userRole, 
  regionId, 
  sectorId, 
  schoolId 
}: DashboardParams): Promise<DashboardData> => {
  if (!userRole) {
    throw new Error('İstifadəçi rolu təyin edilməyib');
  }
  
  try {
    // SuperAdmin üçün statistika
    if (userRole === 'superadmin') {
      // Regionların sayını əldə edirik
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true });
        
      if (regionsError) throw regionsError;
        
      // Sektorların sayını əldə edirik
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true });
      
      if (sectorsError) throw sectorsError;
        
      // Məktəblərin sayını əldə edirik
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
        
      if (schoolsError) throw schoolsError;
        
      // İstifadəçilərin sayını əldə edirik
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) throw profilesError;
      
      // Tamamlanma faizi (burada hələlik sadəcə random bir dəyər, 
      // əslində bütün məktəblərin ortalama tamamlama nisbətini hesablamaq lazımdır)
      const completionRate = Math.floor(Math.random() * 100);
      
      return {
        regions: regionsData?.length || 0,
        sectors: sectorsData?.length || 0,
        schools: schoolsData?.length || 0,
        users: profilesData?.length || 0,
        completionRate: completionRate
      };
    }
    
    // Region admini üçün statistika
    else if (userRole === 'regionadmin' && regionId) {
      // Regiondakı sektorların sayını əldə edirik
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      if (sectorsError) throw sectorsError;
      
      // Aktiv sektorların sayını əldə edirik
      const { data: activeSectorsData, error: activeSectorsError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId)
        .eq('status', 'active');
      
      if (activeSectorsError) throw activeSectorsError;
      
      // Regiondakı məktəblərin sayını əldə edirik
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      if (schoolsError) throw schoolsError;
      
      // Aktiv məktəblərin sayını əldə edirik
      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId)
        .eq('status', 'active');
      
      if (activeSchoolsError) throw activeSchoolsError;
      
      // Tamamlanmamış məktəblərin sayı
      const { data: incompleteSchoolsData, error: incompleteSchoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId)
        .lt('completion_rate', 100);
      
      if (incompleteSchoolsError) throw incompleteSchoolsError;
      
      // Bu regiondakı istifadəçilərin sayını əldə edirik
      const { data: usersData, error: usersError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      if (usersError) throw usersError;
      
      // Tamamlanma faizi (burada hələlik sadəcə random bir dəyər)
      const completionRate = Math.floor(Math.random() * 100);
      
      return {
        sectors: sectorsData?.length || 0,
        activeSectors: activeSectorsData?.length || 0,
        schools: schoolsData?.length || 0,
        activeSchools: activeSchoolsData?.length || 0,
        incompleteSchools: incompleteSchoolsData?.length || 0,
        users: usersData?.length || 0,
        completionRate: completionRate
      };
    }
    
    // Sektor admini üçün statistika
    else if (userRole === 'sectoradmin' && sectorId) {
      // Sektordakı məktəblərin sayını əldə edirik
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      if (schoolsError) throw schoolsError;
      
      // Aktiv məktəblərin sayını əldə edirik
      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId)
        .eq('status', 'active');
      
      if (activeSchoolsError) throw activeSchoolsError;
      
      // Tamamlanmamış məktəblərin sayı
      const { data: incompleteSchoolsData, error: incompleteSchoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId)
        .lt('completion_rate', 100);
      
      if (incompleteSchoolsError) throw incompleteSchoolsError;
      
      // Bu sektordakı istifadəçilərin sayını əldə edirik
      const { data: usersData, error: usersError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      if (usersError) throw usersError;
      
      // Tamamlanma faizi (burada hələlik sadəcə random bir dəyər)
      const completionRate = Math.floor(Math.random() * 100);
      
      return {
        schools: schoolsData?.length || 0,
        activeSchools: activeSchoolsData?.length || 0,
        incompleteSchools: incompleteSchoolsData?.length || 0,
        users: usersData?.length || 0,
        completionRate: completionRate
      };
    }
    
    // Məktəb admini üçün statistika
    else if (userRole === 'schooladmin' && schoolId) {
      // Məktəb kateqoriyaları və onlarla bağlı məlumatlar
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('assignment', 'all');
      
      if (categoriesError) throw categoriesError;
      
      // Formların/məlumatların statistikası
      // Burada random dəyərlər istifadə edirik, əslində data_entries cədvəlindən məlumat gəlməlidir
      const approvedForms = Math.floor(Math.random() * 10);
      const pendingForms = Math.floor(Math.random() * 5);
      const rejectedForms = Math.floor(Math.random() * 3);
      const incompleteForms = Math.floor(Math.random() * 5);
      const draftForms = Math.floor(Math.random() * 2);
      
      const totalForms = approvedForms + pendingForms + rejectedForms + incompleteForms + draftForms;
      
      // Tamamlanma faizini hesablayırıq
      const completionRate = totalForms > 0 
        ? Math.round((approvedForms / totalForms) * 100) 
        : 0;
      
      return {
        totalForms,
        approvedForms,
        pendingForms,
        rejectedForms,
        incompleteForms,
        draftForms,
        completionRate,
        categories: categoriesData
      };
    }
    
    // Digər hallar və ya yanlış parametrlər
    else {
      toast.error('Məlumatları yükləyərkən xəta baş verdi', {
        description: 'Yanlış istifadəçi parametrləri'
      });
      return { completionRate: 0 };
    }
    
  } catch (error: any) {
    console.error('Dashboard məlumatları əldə edərkən xəta:', error);
    toast.error('Məlumatları yükləyərkən xəta baş verdi', {
      description: error.message
    });
    throw error;
  }
};
