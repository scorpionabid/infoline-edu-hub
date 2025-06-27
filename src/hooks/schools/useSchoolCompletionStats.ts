import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SchoolCompletionStats {
  schoolId: string;
  totalCategories: number;
  totalColumns: number;
  filledColumns: number;
  requiredColumns: number;
  filledRequiredColumns: number;
  completionRate: number;
  pendingEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  lastUpdated?: Date;
}

export const useSchoolCompletionStats = (schoolIds: string[]) => {
  const [stats, setStats] = useState<Map<string, SchoolCompletionStats>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize schoolIds to prevent unnecessary re-renders
  const memoizedSchoolIds = useMemo(() => schoolIds, [schoolIds.join(',')]);

  const fetchCompletionStats = useCallback(async () => {
    if (!memoizedSchoolIds || memoizedSchoolIds.length === 0) {
      setStats(new Map());
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching completion stats for schools:', memoizedSchoolIds.length);
      
      // Simplified approach - just get basic data entries count for now
      const { data: dataEntries, error: entriesError } = await supabase
        .from('data_entries')
        .select('school_id, status, updated_at')
        .in('school_id', memoizedSchoolIds);
        
      if (entriesError) {
        console.error('Data entries error:', entriesError);
        throw entriesError;
      }
      
      console.log('Fetched data entries:', dataEntries?.length);
      
      // Calculate basic stats for each school
      const schoolStatsMap = new Map<string, SchoolCompletionStats>();
      
      memoizedSchoolIds.forEach(schoolId => {
        const schoolEntries = (dataEntries || []).filter(entry => entry.school_id === schoolId);
        
        // Count entries by status
        const pendingEntries = schoolEntries.filter(entry => entry.status === 'pending').length;
        const approvedEntries = schoolEntries.filter(entry => entry.status === 'approved').length;
        const rejectedEntries = schoolEntries.filter(entry => entry.status === 'rejected').length;
        const totalEntries = schoolEntries.length;
        
        // Simple completion rate based on approved/total ratio
        const completionRate = totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0;
        
        // Get last updated date
        let lastUpdated: Date | undefined = undefined;
        try {
          if (schoolEntries.length > 0) {
            const validDates = schoolEntries
              .filter(entry => entry.updated_at)
              .map(entry => new Date(entry.updated_at));
            
            if (validDates.length > 0) {
              lastUpdated = new Date(Math.max(...validDates.map(d => d.getTime())));
            }
          }
        } catch (err) {
          console.warn('Tarix hesablama xətası:', err);
        }
        
        schoolStatsMap.set(schoolId, {
          schoolId,
          totalCategories: 0, // Will implement later
          totalColumns: totalEntries, // Using total entries as proxy
          filledColumns: approvedEntries + pendingEntries,
          requiredColumns: 0, // Will implement later
          filledRequiredColumns: 0, // Will implement later
          completionRate,
          pendingEntries,
          approvedEntries,
          rejectedEntries,
          lastUpdated // Artıq düzgün təyin edilib
        });
      });
      
      console.log('Calculated stats for schools:', schoolStatsMap.size);
      setStats(schoolStatsMap);
      
    } catch (err: any) {
      console.error('Error fetching school completion stats:', err);
      setError(err.message);
      
      // Fallback to empty stats to prevent UI from breaking
      const fallbackStats = new Map<string, SchoolCompletionStats>();
      memoizedSchoolIds.forEach(schoolId => {
        fallbackStats.set(schoolId, {
          schoolId,
          totalCategories: 0,
          totalColumns: 0,
          filledColumns: 0,
          requiredColumns: 0,
          filledRequiredColumns: 0,
          completionRate: 0,
          pendingEntries: 0,
          approvedEntries: 0,
          rejectedEntries: 0
        });
      });
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  }, [memoizedSchoolIds]); // Only depend on memoized school IDs
  
  useEffect(() => {
    fetchCompletionStats();
  }, [fetchCompletionStats]);
  
  const getStatsForSchool = useCallback((schoolId: string): SchoolCompletionStats | null => {
    return stats.get(schoolId) || {
      schoolId,
      totalCategories: 0,
      totalColumns: 0,
      filledColumns: 0,
      requiredColumns: 0,
      filledRequiredColumns: 0,
      completionRate: 0,
      pendingEntries: 0,
      approvedEntries: 0,
      rejectedEntries: 0
    };
  }, [stats]);
  
  const refreshStats = useCallback(() => {
    fetchCompletionStats();
  }, [fetchCompletionStats]);
  
  return {
    stats,
    loading,
    error,
    getStatsForSchool,
    // refreshStats
  };
};

export default useSchoolCompletionStats;
