import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useReportsData, ReportsFilters } from './useReportsData';

// Types for user role and permissions
export interface UserRole {
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  user_id: string;
}

export interface RoleBasedFilters extends ReportsFilters {
  // Additional filters based on user role
  enforced?: boolean; // Whether filters are enforced by role
}

export const useRoleBasedReports = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const reportsData = useReportsData();

  // Get current user's role and permissions
  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('İstifadəçi tapılmadı');
        }

        // Get user role from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id, user_id')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          throw new Error('İstifadəçi rolu tapılmadı');
        }

        setUserRole(roleData as UserRole);
      } catch (err: any) {
        console.error('Error getting user role:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserRole();
  }, []);

  // Apply role-based filters to reports filters
  const applyRoleBasedFilters = (filters: ReportsFilters = {}): RoleBasedFilters => {
    if (!userRole) return filters;

    const roleBasedFilters: RoleBasedFilters = { ...filters };

    switch (userRole.role) {
      case 'superadmin':
        // SuperAdmin can see everything, no restrictions
        roleBasedFilters.enforced = false;
        break;

      case 'regionadmin':
        // RegionAdmin can only see their region
        roleBasedFilters.region_id = userRole.region_id;
        roleBasedFilters.enforced = true;
        break;

      case 'sectoradmin':
        // SectorAdmin can only see their sector
        roleBasedFilters.sector_id = userRole.sector_id;
        roleBasedFilters.region_id = userRole.region_id;
        roleBasedFilters.enforced = true;
        break;

      case 'schooladmin':
        // SchoolAdmin can only see their school
        // For school admin, we need a different approach since most reports are school-based
        roleBasedFilters.sector_id = userRole.sector_id;
        roleBasedFilters.region_id = userRole.region_id;
        roleBasedFilters.enforced = true;
        break;

      default:
        // Unknown role, apply no access
        roleBasedFilters.enforced = true;
        roleBasedFilters.region_id = 'no-access';
    }

    return roleBasedFilters;
  };

  // Get school performance report with role-based filtering
  const getSchoolPerformanceReport = async (filters: ReportsFilters = {}) => {
    const roleBasedFilters = applyRoleBasedFilters(filters);
    return await reportsData.getSchoolPerformanceReport(roleBasedFilters);
  };

  // Get regional comparison report with role-based filtering
  const getRegionalComparisonReport = async (filters: { date_from?: string; date_to?: string } = {}) => {
    // Regional comparison is only available for superadmin and regionadmin
    if (!userRole || !['superadmin', 'regionadmin'].includes(userRole.role)) {
      throw new Error('Bu hesabata girmək üçün icazəniz yoxdur');
    }

    return await reportsData.getRegionalComparisonReport(filters);
  };

  // Get category completion report with role-based filtering
  const getCategoryCompletionReport = async (filters: ReportsFilters = {}) => {
    const roleBasedFilters = applyRoleBasedFilters(filters);
    return await reportsData.getCategoryCompletionReport(roleBasedFilters);
  };

  // Get school data by category with role-based filtering
  const getSchoolDataByCategory = async (school_id: string, category_id: string) => {
    // Check if user has access to this school
    if (userRole?.role === 'schooladmin' && userRole.school_id !== school_id) {
      throw new Error('Bu məktəbin məlumatlarına girmək üçün icazəniz yoxdur');
    }

    // For other roles, RLS will handle the filtering
    return await reportsData.getSchoolDataByCategory(school_id, category_id);
  };

  // Get dashboard statistics with role-based filtering
  const getDashboardStatistics = async () => {
    const roleBasedFilters = applyRoleBasedFilters({});
    return await reportsData.getDashboardStatistics({
      region_id: roleBasedFilters.region_id,
      sector_id: roleBasedFilters.sector_id,
    });
  };

  // Get available filter options based on user role
  const getAvailableFilterOptions = () => {
    if (!userRole) return { regions: [], sectors: [], schools: [] };

    const options = {
      regions: [] as Array<{ id: string; name: string }>,
      sectors: [] as Array<{ id: string; name: string }>,
      schools: [] as Array<{ id: string; name: string }>,
      canSelectRegion: false,
      canSelectSector: false,
      canSelectSchool: false,
    };

    switch (userRole.role) {
      case 'superadmin':
        options.canSelectRegion = true;
        options.canSelectSector = true;
        options.canSelectSchool = true;
        break;

      case 'regionadmin':
        options.canSelectSector = true;
        options.canSelectSchool = true;
        // They can only work within their region
        break;

      case 'sectoradmin':
        options.canSelectSchool = true;
        // They can only work within their sector
        break;

      case 'schooladmin':
        // They can only work with their school
        break;
    }

    return options;
  };

  // Check if user can access specific report type
  const canAccessReportType = (reportType: string): boolean => {
    if (!userRole) return false;

    switch (reportType) {
      case 'regional_comparison':
        return ['superadmin', 'regionadmin'].includes(userRole.role);
      
      case 'school_performance':
      case 'category_completion':
        return true; // All roles can access these (with filtering)
      
      case 'system_wide':
        return userRole.role === 'superadmin';
      
      default:
        return true;
    }
  };

  // Get role-specific report templates
  const getAvailableTemplates = () => {
    const allTemplates = [
      {
        id: 'template_school_performance',
        name: 'Məktəb Performans Hesabatı',
        description: 'Məktəblərin ətraflı performans analizi',
        type: 'performance',
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
      },
      {
        id: 'template_regional_comparison',
        name: 'Regional Müqayisə',
        description: 'Regionlar arasında performans müqayisəsi',
        type: 'comparison',
        allowedRoles: ['superadmin', 'regionadmin']
      },
      {
        id: 'template_category_completion',
        name: 'Kateqoriya Tamamlanma Hesabatı',
        description: 'Kateqoriyalar üzrə tamamlanma statusu',
        type: 'category',
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin']
      },
      {
        id: 'template_sector_overview',
        name: 'Sektor İcmalı',
        description: 'Sektor üzrə ümumi performans',
        type: 'sector',
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin']
      },
      {
        id: 'template_school_detailed',
        name: 'Məktəb Ətraflı Hesabat',
        description: 'Tək məktəb üçün ətraflı analiz',
        type: 'school_detailed',
        allowedRoles: ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']
      }
    ];

    return allTemplates.filter(template => 
      userRole && template.allowedRoles.includes(userRole.role)
    );
  };

  // Get role-based permissions summary
  const getPermissionsSummary = () => {
    if (!userRole) return null;

    return {
      role: userRole.role,
      canViewAllRegions: userRole.role === 'superadmin',
      canViewMultipleRegions: ['superadmin'].includes(userRole.role),
      canViewMultipleSectors: ['superadmin', 'regionadmin'].includes(userRole.role),
      canViewMultipleSchools: ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole.role),
      canCreateReports: true,
      canExportReports: true,
      canManageTemplates: ['superadmin', 'regionadmin'].includes(userRole.role),
      restrictions: {
        region_id: userRole.region_id,
        sector_id: userRole.sector_id,
        school_id: userRole.school_id,
      }
    };
  };

  // Helper function to format role display name
  const getRoleDisplayName = (role: string): string => {
    const roleNames = {
      superadmin: 'Super Administrator',
      regionadmin: 'Region Administratoru',
      sectoradmin: 'Sektor Administratoru',
      schooladmin: 'Məktəb Administratoru'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return {
    // State
    userRole,
    loading,
    error,

    // Data fetching functions with role-based filtering
    getSchoolPerformanceReport,
    getRegionalComparisonReport,
    getCategoryCompletionReport,
    getSchoolDataByCategory,
    getDashboardStatistics,

    // Role-based utilities
    applyRoleBasedFilters,
    getAvailableFilterOptions,
    canAccessReportType,
    getAvailableTemplates,
    getPermissionsSummary,
    getRoleDisplayName,

    // Direct access to base functions (for cases where manual filtering is needed)
    baseReportsData: reportsData,
  };
};

// Hook specifically for role-based filter components
export const useRoleBasedFilters = () => {
  const { userRole, getAvailableFilterOptions, loading } = useRoleBasedReports();
  const [availableRegions, setAvailableRegions] = useState<Array<{ id: string; name: string }>>([]);
  const [availableSectors, setAvailableSectors] = useState<Array<{ id: string; name: string }>>([]);
  const [availableSchools, setAvailableSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      if (!userRole || loading) return;

      try {
        // Load regions (only for superadmin)
        if (userRole.role === 'superadmin') {
          const { data: regions } = await supabase
            .from('regions')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
          setAvailableRegions(regions || []);
        }

        // Load sectors (for superadmin and regionadmin)
        if (['superadmin', 'regionadmin'].includes(userRole.role)) {
          let sectorsQuery = supabase
            .from('sectors')
            .select('id, name')
            .eq('status', 'active');

          if (userRole.role === 'regionadmin' && userRole.region_id) {
            sectorsQuery = sectorsQuery.eq('region_id', userRole.region_id);
          }

          const { data: sectors } = await sectorsQuery.order('name');
          setAvailableSectors(sectors || []);
        }

        // Load schools (for all except schooladmin who only sees their own)
        if (['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole.role)) {
          let schoolsQuery = supabase
            .from('schools')
            .select('id, name')
            .eq('status', 'active');

          if (userRole.role === 'regionadmin' && userRole.region_id) {
            schoolsQuery = schoolsQuery.eq('region_id', userRole.region_id);
          } else if (userRole.role === 'sectoradmin' && userRole.sector_id) {
            schoolsQuery = schoolsQuery.eq('sector_id', userRole.sector_id);
          }

          const { data: schools } = await schoolsQuery.order('name');
          setAvailableSchools(schools || []);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      }
    };

    loadFilterOptions();
  }, [userRole, loading]);

  return {
    userRole,
    loading,
    availableRegions,
    availableSectors,
    availableSchools,
    filterOptions: getAvailableFilterOptions(),
  };
};

export type { UserRole, RoleBasedFilters };
