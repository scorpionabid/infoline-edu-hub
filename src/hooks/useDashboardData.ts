import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from './useCategories';
import { useDataEntries } from './useDataEntries';
import { useSchools } from './useSchools';
import { useSectors } from './useSectors';
import { useRegions } from './useRegions';

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'dueSoon' | 'overdue';

interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  pendingForms: {
    id: string;
    title: string;
    category: string;
    status: FormStatus;
    completionPercentage: number;
    deadline?: string;
  }[];
  upcomingDeadlines: {
    category: string;
    date: string;
  }[];
  regionalStats: {
    region: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
  sectorStats: {
    sector: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSchools: 0,
    activeSchools: 0,
    pendingForms: [],
    upcomingDeadlines: [],
    regionalStats: [],
    sectorStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { dataEntries } = useDataEntries();
  const { schools } = useSchools();
  const { sectors } = useSectors();
  const { regions } = useRegions();

  const transformDeadlineToString = (deadline: string | Date | undefined): string => {
    if (!deadline) return '';
    return typeof deadline === 'string' ? deadline : deadline.toISOString();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Total school count
      const totalSchools = schools?.length || 0;

      // Active school count
      const activeSchools = schools?.filter(school => school.status === 'active').length || 0;

      // Pending forms with completion percentage and status
      let pendingForms: {
        id: string;
        title: string;
        category: string;
        status: FormStatus;
        completionPercentage: number;
        deadline?: string | Date;
      }[] = [];

      if (categories && dataEntries) {
        pendingForms = categories.map(category => {
          const categoryEntries = dataEntries.filter(entry => entry.category_id === category.id);
          const approvedCount = categoryEntries.filter(entry => entry.status === 'approved').length;
          const rejectedCount = categoryEntries.filter(entry => entry.status === 'rejected').length;
          const totalEntries = categoryEntries.length;
          let status: FormStatus = 'draft';

          if (totalEntries === 0) {
            status = 'draft';
          } else if (categoryEntries.every(entry => entry.status === 'approved')) {
            status = 'approved';
          } else if (categoryEntries.some(entry => entry.status === 'rejected')) {
            status = 'rejected';
          } else {
            status = 'pending';
          }

          const completionPercentage = totalEntries > 0 ? Math.round((approvedCount / totalEntries) * 100) : 0;

          return {
            id: category.id,
            title: category.name,
            category: category.name,
            status: status,
            completionPercentage: completionPercentage,
            deadline: category.deadline
          };
        });
      }

      // Upcoming deadlines
      let upcomingDeadlines: { category: string; date: string | Date }[] = [];

      if (categories) {
        upcomingDeadlines = categories
          .filter(category => category.deadline)
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5)
          .map(category => ({
            category: category.name,
            date: category.deadline!
          }));
      }

      // Regional stats
      let regionalStats: { region: string; approved: number; pending: number; rejected: number }[] = [];

      if (regions && schools && dataEntries) {
        regionalStats = regions.map(region => {
          const regionSchools = schools.filter(school => school.region_id === region.id);
          let approved = 0;
          let pending = 0;
          let rejected = 0;

          regionSchools.forEach(school => {
            const schoolEntries = dataEntries.filter(entry => entry.school_id === school.id);
            approved += schoolEntries.filter(entry => entry.status === 'approved').length;
            pending += schoolEntries.filter(entry => entry.status === 'pending').length;
            rejected += schoolEntries.filter(entry => entry.status === 'rejected').length;
          });

          return {
            region: region.name,
            approved: approved,
            pending: pending,
            rejected: rejected
          };
        });
      }

      // Sector stats
      let sectorStats: { sector: string; approved: number; pending: number; rejected: number }[] = [];

      if (sectors && schools && dataEntries) {
        sectorStats = sectors.map(sector => {
          const sectorSchools = schools.filter(school => school.sector_id === sector.id);
          let approved = 0;
          let pending = 0;
          let rejected = 0;

          sectorSchools.forEach(school => {
            const schoolEntries = dataEntries.filter(entry => entry.school_id === school.id);
            approved += schoolEntries.filter(entry => entry.status === 'approved').length;
            pending += schoolEntries.filter(entry => entry.status === 'pending').length;
            rejected += schoolEntries.filter(entry => entry.status === 'rejected').length;
          });

          return {
            sector: sector.name,
            approved: approved,
            pending: pending,
            rejected: rejected
          };
        });
      }

      upcomingDeadlines = upcomingDeadlines.map(item => ({
        category: item.category,
        date: transformDeadlineToString(item.date)
      }));

      pendingForms = pendingForms.map(form => ({
        ...form,
        deadline: form.deadline ? transformDeadlineToString(form.deadline) : undefined
      }));

      setDashboardData({
        totalSchools,
        activeSchools,
        pendingForms,
        upcomingDeadlines,
        regionalStats,
        sectorStats
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [t, user, categories, dataEntries, schools, sectors, regions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dashboardData, loading, error };
};
