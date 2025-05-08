// Fix type issues with array access and type casting
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { DataEntryRecord } from '@/types/dataEntry'; 

export const useApprovalData = () => {
  const [approvalData, setApprovalData] = useState<DataEntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    fetchApprovalData();
  }, [session]);

  const fetchApprovalData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select(`
          id, value, status, created_at, created_by, category_id, column_id, school_id,
          categories ( id, name ),
          columns ( id, name ),
          schools ( id, name, sector_id, sectors ( id, name, region_id ) )
        `)
        .eq('status', 'pending');

      if (error) {
        setError(error);
        console.error("Error fetching approval data:", error);
      } else {
        const transformedData = transformData(data);
        setApprovalData(transformedData);
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error fetching approval data:", err);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (rawData: any[]): DataEntryRecord[] => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    // Transform data with proper type casting
    return rawData.map((item: any) => ({
      id: item.id,
      value: item.value,
      status: item.status,
      created_at: item.created_at,
      created_by: item.created_by,
      category_id: item.category_id,
      column_id: item.column_id,
      school_id: item.school_id,
      categories: {
        id: item.categories?.id,
        name: item.categories?.name
      },
      columns: {
        id: item.columns?.id,
        name: item.columns?.name
      },
      schools: Array.isArray(item.schools) ? item.schools.map((school: any) => ({
        id: school?.id,
        name: school?.name,
        sector_id: school?.sector_id,
        sectors: Array.isArray(school?.sectors) ? school.sectors.map((sector: any) => ({
          id: sector?.id,
          name: sector?.name,
          region_id: sector?.region_id
        })) : []
      })) : []
    }));
  };
  
  const approveEntry = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('data_entries')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) {
        setError(error);
        console.error("Error approving entry:", error);
      } else {
        setApprovalData(prevData => prevData.filter(item => item.id !== id));
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error approving entry:", err);
    } finally {
      setLoading(false);
    }
  };

  const rejectEntry = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('data_entries')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) {
        setError(error);
        console.error("Error rejecting entry:", error);
      } else {
        setApprovalData(prevData => prevData.filter(item => item.id !== id));
      }
    } catch (err: any) {
      setError(err);
      console.error("Unexpected error rejecting entry:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    approvalData,
    loading,
    error,
    fetchApprovalData,
    approveEntry,
    rejectEntry
  };
};

export default useApprovalData;
