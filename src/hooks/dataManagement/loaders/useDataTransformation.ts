
import { useMemo } from 'react';
import type { SchoolDataEntry } from '../types';

export const useDataTransformation = () => {
  const transformSchoolData = useMemo(() => {
    return (rawData: any[]): SchoolDataEntry[] => {
      return rawData.map(entry => ({
        id: entry.id,
        school_id: entry.school_id,
        school_name: entry.schools?.name || 'Naməlum məktəb',
        category_id: entry.category_id,
        column_id: entry.column_id,
        value: entry.column_data?.[entry.column_id] || '',
        status: entry.status || 'empty',
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));
    };
  }, []);

  const calculateStatsFromData = useMemo(() => {
    return (data: SchoolDataEntry[]) => {
      const totalSchools = data.length;
      const pendingCount = data.filter(item => item.status === 'pending').length;
      const approvedCount = data.filter(item => item.status === 'approved').length;
      const rejectedCount = data.filter(item => item.status === 'rejected').length;
      const emptyCount = data.filter(item => item.status === 'empty').length;
      const completionRate = totalSchools > 0 ? Math.round((approvedCount / totalSchools) * 100) : 0;

      return {
        totalSchools,
        pendingCount,
        approvedCount,
        rejectedCount,
        emptyCount,
        completionRate,
        totalEntries: totalSchools,
        completedEntries: approvedCount,
        pendingEntries: pendingCount
      };
    };
  }, []);

  return {
    transformSchoolData,
    calculateStatsFromData
  };
};
