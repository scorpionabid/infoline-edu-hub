
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export interface UserContextData {
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
  displayText: string;
  displayLines: string[];
  isLoading: boolean;
}

export function useUserContext(): UserContextData {
  const user = useAuthStore(selectUser);
  const [contextData, setContextData] = useState<{
    regionName?: string;
    sectorName?: string;
    schoolName?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setContextData({});
      return;
    }

    const fetchContextData = async () => {
      setIsLoading(true);
      try {
        const promises: Promise<{ type: string; name: any }>[] = [];

        // Fetch region name if user has region_id
        if (user.region_id) {
          promises.push(
            supabase
              .from('regions')
              .select('name')
              .eq('id', user.region_id)
              .single()
              .then(({ data }) => ({ type: 'region', name: data?.name }))
              .catch(() => ({ type: 'region', name: null }))
          );
        }

        // Fetch sector name if user has sector_id
        if (user.sector_id) {
          promises.push(
            supabase
              .from('sectors')
              .select('name')
              .eq('id', user.sector_id)
              .single()
              .then(({ data }) => ({ type: 'sector', name: data?.name }))
              .catch(() => ({ type: 'sector', name: null }))
          );
        }

        // Fetch school name if user has school_id
        if (user.school_id) {
          promises.push(
            supabase
              .from('schools')
              .select('name')
              .eq('id', user.school_id)
              .single()
              .then(({ data }) => ({ type: 'school', name: data?.name }))
              .catch(() => ({ type: 'school', name: null }))
          );
        }

        const results = await Promise.all(promises);
        
        const newContextData: typeof contextData = {};
        results.forEach((result) => {
          if (result.name) {
            if (result.type === 'region') newContextData.regionName = result.name;
            else if (result.type === 'sector') newContextData.sectorName = result.name;
            else if (result.type === 'school') newContextData.schoolName = result.name;
          }
        });

        setContextData(newContextData);
      } catch (error) {
        console.error('Error fetching user context data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContextData();
  }, [user?.region_id, user?.sector_id, user?.school_id]);

  const displayInfo = useMemo(() => {
    if (!user) {
      return {
        displayText: 'İnfoLine',
        displayLines: ['İnfoLine']
      };
    }

    const lines: string[] = [];
    
    // Add role-based context
    if (user.role === 'superadmin') {
      lines.push('Sistem Administratoru');
    } else if (user.role === 'regionadmin' && contextData.regionName) {
      lines.push(`${contextData.regionName} Regionu`);
    } else if (user.role === 'sectoradmin') {
      if (contextData.sectorName) {
        lines.push(`${contextData.sectorName} Sektoru`);
      }
      if (contextData.regionName) {
        lines.push(`${contextData.regionName} Regionu`);
      }
    } else if (user.role === 'schooladmin') {
      if (contextData.schoolName) {
        // Split long school names into two lines
        const schoolName = contextData.schoolName;
        if (schoolName.length > 25) {
          const words = schoolName.split(' ');
          const midpoint = Math.ceil(words.length / 2);
          lines.push(words.slice(0, midpoint).join(' '));
          lines.push(words.slice(midpoint).join(' '));
        } else {
          lines.push(schoolName);
        }
      }
      if (contextData.sectorName) {
        lines.push(`${contextData.sectorName} Sektoru`);
      }
    }

    // Fallback if no specific context
    if (lines.length === 0) {
      lines.push('İnfoLine');
    }

    return {
      displayText: lines.join(' • '),
      displayLines: lines
    };
  }, [user, contextData]);

  return {
    ...contextData,
    ...displayInfo,
    isLoading
  };
}
