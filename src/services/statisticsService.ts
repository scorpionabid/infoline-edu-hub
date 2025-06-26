
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/supabase';

export interface StatisticsData {
  totalSchools: number;
  totalUsers: number;
  totalRegions: number;
  totalSectors: number;
  completionRate: number;
  approvalRate: number;
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
  };
  schoolPerformance: Array<{
    id: string;
    name: string;
    completionRate: number;
    totalForms: number;
    completedForms: number;
  }>;
  sectorPerformance: Array<{
    id: string;
    name: string;
    schoolCount: number;
    averageCompletion: number;
  }>;
  regionPerformance: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    averageCompletion: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    submissions: number;
    approvals: number;
  }>;
}

export interface StatisticsFilters {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  regionId?: string;
  sectorId?: string;
  categoryId?: string;
  status?: string;
}

class StatisticsService {
  async getStatistics(
    userRole: UserRole,
    entityId?: string,
    filters?: StatisticsFilters
  ): Promise<StatisticsData> {
    try {
      switch (userRole) {
        case 'superadmin': {
          return await this.getSuperAdminStatistics(filters);
        case 'regionadmin': {
          return await this.getRegionAdminStatistics(entityId!, filters);
        case 'sectoradmin': {
          return await this.getSectorAdminStatistics(entityId!, filters);
        default:
          throw new Error('Bu rol üçün statistika mövcud deyil');
      }
    } catch (error) {
      console.error('Statistika məlumatlarını əldə edərkən xəta:', error);
      return this.getDefaultStatistics();
    }
  }

  private async getSuperAdminStatistics(filters?: StatisticsFilters): Promise<StatisticsData> {
    const [
      schoolsResult,
      usersResult,
      regionsResult,
      sectorsResult,
      // dataEntriesResult
    ] = await Promise.all([
      this.getSchoolsCount(filters),
      this.getUsersCount(filters),
      this.getRegionsCount(filters),
      this.getSectorsCount(filters),
      this.getDataEntriesStats(filters)
    ]);

    const [
      schoolPerformance,
      sectorPerformance,
      regionPerformance,
      // timeSeriesData
    ] = await Promise.all([
      this.getSchoolPerformance(filters),
      this.getSectorPerformance(filters),
      this.getRegionPerformance(filters),
      this.getTimeSeriesData(filters)
    ]);

    return {
      totalSchools: schoolsResult || 0,
      totalUsers: usersResult || 0,
      totalRegions: regionsResult || 0,
      totalSectors: sectorsResult || 0,
      completionRate: dataEntriesResult.completionRate,
      approvalRate: dataEntriesResult.approvalRate,
      formsByStatus: dataEntriesResult.formsByStatus,
      schoolPerformance,
      sectorPerformance,
      regionPerformance,
      // timeSeriesData
    };
  }

  private async getRegionAdminStatistics(regionId: string, filters?: StatisticsFilters): Promise<StatisticsData> {
    const regionFilter = { ...filters, regionId };
    
    const [
      schoolsResult,
      sectorsResult,
      // dataEntriesResult
    ] = await Promise.all([
      this.getSchoolsCount(regionFilter),
      this.getSectorsCount(regionFilter),
      this.getDataEntriesStats(regionFilter)
    ]);

    const [
      schoolPerformance,
      sectorPerformance,
      // timeSeriesData
    ] = await Promise.all([
      this.getSchoolPerformance(regionFilter),
      this.getSectorPerformance(regionFilter),
      this.getTimeSeriesData(regionFilter)
    ]);

    return {
      totalSchools: schoolsResult || 0,
      totalUsers: 0,
      totalRegions: 1,
      totalSectors: sectorsResult || 0,
      completionRate: dataEntriesResult.completionRate,
      approvalRate: dataEntriesResult.approvalRate,
      formsByStatus: dataEntriesResult.formsByStatus,
      schoolPerformance,
      sectorPerformance,
      regionPerformance: [],
      // timeSeriesData
    };
  }

  private async getSectorAdminStatistics(sectorId: string, filters?: StatisticsFilters): Promise<StatisticsData> {
    const sectorFilter = { ...filters, sectorId };
    
    const [
      schoolsResult,
      // dataEntriesResult
    ] = await Promise.all([
      this.getSchoolsCount(sectorFilter),
      this.getDataEntriesStats(sectorFilter)
    ]);

    const [
      schoolPerformance,
      // timeSeriesData
    ] = await Promise.all([
      this.getSchoolPerformance(sectorFilter),
      this.getTimeSeriesData(sectorFilter)
    ]);

    return {
      totalSchools: schoolsResult || 0,
      totalUsers: 0,
      totalRegions: 0,
      totalSectors: 1,
      completionRate: dataEntriesResult.completionRate,
      approvalRate: dataEntriesResult.approvalRate,
      formsByStatus: dataEntriesResult.formsByStatus,
      schoolPerformance,
      sectorPerformance: [],
      regionPerformance: [],
      // timeSeriesData
    };
  }

  private async getSchoolsCount(filters?: StatisticsFilters): Promise<number> {
    let query = supabase.from('schools').select('id', { count: 'exact', head: true });
    
    if (filters?.regionId) {
      query = query.eq('region_id', filters.regionId);
    }
    if (filters?.sectorId) {
      query = query.eq('sector_id', filters.sectorId);
    }
    
    const { count } = await query;
    return count || 0;
  }

  private async getUsersCount(filters?: StatisticsFilters): Promise<number> {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    return count || 0;
  }

  private async getRegionsCount(filters?: StatisticsFilters): Promise<number> {
    const { count } = await supabase
      .from('regions')
      .select('id', { count: 'exact', head: true });
    return count || 0;
  }

  private async getSectorsCount(filters?: StatisticsFilters): Promise<number> {
    let query = supabase.from('sectors').select('id', { count: 'exact', head: true });
    
    if (filters?.regionId) {
      query = query.eq('region_id', filters.regionId);
    }
    
    const { count } = await query;
    return count || 0;
  }

  private async getDataEntriesStats(filters?: StatisticsFilters) {
    let query = supabase.from('data_entries').select('status, school_id');
    
    if (filters?.regionId) {
      query = query.eq('schools.region_id', filters.regionId);
    }
    if (filters?.sectorId) {
      query = query.eq('schools.sector_id', filters.sectorId);
    }
    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.startDate)
        .lte('created_at', filters.dateRange.endDate);
    }
    
    const { data: entries } = await query;
    
    if (!entries) {
      return {
        completionRate: 0,
        approvalRate: 0,
        formsByStatus: {
          pending: 0,
          approved: 0,
          rejected: 0,
          draft: 0,
          total: 0
        }
      };
    }

    const total = entries.length;
    const approved = entries.filter(e => e.status === 'approved').length;
    const pending = entries.filter(e => e.status === 'pending').length;
    const rejected = entries.filter(e => e.status === 'rejected').length;
    const draft = entries.filter(e => e.status === 'draft').length;

    return {
      completionRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      formsByStatus: {
        pending,
        approved,
        rejected,
        draft,
        // total
      }
    };
  }

  private async getSchoolPerformance(filters?: StatisticsFilters) {
    let query = supabase
      .from('schools')
      .select(`
        id,
        name,
        data_entries(status)
      `);
    
    if (filters?.regionId) {
      query = query.eq('region_id', filters.regionId);
    }
    if (filters?.sectorId) {
      query = query.eq('sector_id', filters.sectorId);
    }
    
    const { data: schools } = await query;
    
    if (!schools) return [];
    
    return schools.map(school => {
      const entries = school.data_entries || [];
      const total = entries.length;
      const completed = entries.filter((e: any) => e.status === 'approved').length;
      
      return {
        id: school.id,
        name: school.name,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        totalForms: total,
        completedForms: completed
      };
    });
  }

  private async getSectorPerformance(filters?: StatisticsFilters) {
    let query = supabase
      .from('sectors')
      .select(`
        id,
        name,
        schools(id, data_entries(status))
      `);
    
    if (filters?.regionId) {
      query = query.eq('region_id', filters.regionId);
    }
    
    const { data: sectors } = await query;
    
    if (!sectors) return [];
    
    return sectors.map(sector => {
      const schools = sector.schools || [];
      const schoolCount = schools.length;
      
      let totalEntries = 0;
      let completedEntries = 0;
      
      schools.forEach((school: any) => {
        const entries = school.data_entries || [];
        totalEntries += entries.length;
        completedEntries += entries.filter((e: any) => e.status === 'approved').length;
      });
      
      return {
        id: sector.id,
        name: sector.name,
        schoolCount,
        averageCompletion: totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0
      };
    });
  }

  private async getRegionPerformance(filters?: StatisticsFilters) {
    const { data: regions } = await supabase
      .from('regions')
      .select(`
        id,
        name,
        sectors(id, schools(id, data_entries(status)))
      `);
    
    if (!regions) return [];
    
    return regions.map(region => {
      const sectors = region.sectors || [];
      const sectorCount = sectors.length;
      
      let totalSchools = 0;
      let totalEntries = 0;
      let completedEntries = 0;
      
      sectors.forEach((sector: any) => {
        const schools = sector.schools || [];
        totalSchools += schools.length;
        
        schools.forEach((school: any) => {
          const entries = school.data_entries || [];
          totalEntries += entries.length;
          completedEntries += entries.filter((e: any) => e.status === 'approved').length;
        });
      });
      
      return {
        id: region.id,
        name: region.name,
        sectorCount,
        schoolCount: totalSchools,
        averageCompletion: totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0
      };
    });
  }

  private async getTimeSeriesData(filters?: StatisticsFilters) {
    const endDate = filters?.dateRange?.endDate || new Date().toISOString();
    const startDate = filters?.dateRange?.startDate || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 gün əvvəl

    const query = supabase
      .from('data_entries')
      .select('created_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');
    
    const { data: entries } = await query;
    
    if (!entries) return [];
    
    // Günlük məlumatları qruplaşdır
    const dailyStats: { [key: string]: { submissions: number; approvals: number } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      
      if (!dailyStats[date]) {
        dailyStats[date] = { submissions: 0, approvals: 0 };
      }
      
      dailyStats[date].submissions++;
      if (entry.status === 'approved') {
        dailyStats[date].approvals++;
      }
    });
    
    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      submissions: stats.submissions,
      approvals: stats.approvals
    }));
  }

  private getDefaultStatistics(): StatisticsData {
    return {
      totalSchools: 0,
      totalUsers: 0,
      totalRegions: 0,
      totalSectors: 0,
      completionRate: 0,
      approvalRate: 0,
      formsByStatus: {
        pending: 0,
        approved: 0,
        rejected: 0,
        draft: 0,
        total: 0
      },
      schoolPerformance: [],
      sectorPerformance: [],
      regionPerformance: [],
      timeSeriesData: []
    };
  }
}

export const statisticsService = new StatisticsService();
