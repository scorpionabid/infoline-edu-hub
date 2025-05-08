
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useToast } from '@/components/ui/use-toast';

export const useApprovalData = () => {
  const [loading, setLoading] = useState(true);
  const [approvalData, setApprovalData] = useState<any[]>([]);
  const { toast } = useToast();
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  
  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('data_entries')
          .select(`
            id,
            value,
            status,
            created_at,
            updated_at,
            created_by,
            approved_by,
            approved_at,
            rejected_by,
            rejection_reason,
            schools!inner (
              id,
              name,
              region_id,
              sector_id
            ),
            categories!inner (
              id,
              name
            ),
            columns!inner (
              id,
              name,
              type
            )
          `)
          .eq('status', 'pending');
        
        // Filter based on user role
        if (userRole === 'regionadmin' && regionId) {
          query = query.eq('schools.region_id', regionId);
        } else if (userRole === 'sectoradmin' && sectorId) {
          query = query.eq('schools.sector_id', sectorId);
        } else if (userRole === 'schooladmin' && schoolId) {
          query = query.eq('school_id', schoolId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Process and transform the data for display
        const processedData = data.map(item => ({
          id: item.id,
          schoolName: item.schools?.name || 'Unknown School',
          categoryName: item.categories?.name || 'Unknown Category',
          columnName: item.columns?.name || 'Unknown Column',
          value: item.value,
          status: item.status,
          submittedAt: new Date(item.created_at).toLocaleString(),
          // Specify types for region_id and sector_id to avoid TS errors
          region_id: (item.schools as { region_id: string }).region_id || '',
          sector_id: (item.schools as { sector_id: string }).sector_id || '',
          // Add region and sector names - these would come from additional queries in a real app
          regionName: '', // Will be filled later
          sectorName: '' // Will be filled later
        }));
        
        // In a real app, you would fetch region and sector names
        const enhancedData = await Promise.all(processedData.map(async (item) => {
          // Fetch region name if needed
          if (item.region_id) {
            const { data: regionData } = await supabase
              .from('regions')
              .select('name')
              .eq('id', item.region_id)
              .single();
              
            item.regionName = regionData?.name || 'Unknown Region';
          }
          
          // Fetch sector name if needed
          if (item.sector_id) {
            const { data: sectorData } = await supabase
              .from('sectors')
              .select('name')
              .eq('id', item.sector_id)
              .single();
              
            item.sectorName = sectorData?.name || 'Unknown Sector';
          }
          
          return item;
        }));
        
        setApprovalData(enhancedData);
      } catch (error: any) {
        console.error('Error fetching approval data:', error);
        toast({
          title: 'Failed to load approvals',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovals();
  }, [userRole, regionId, sectorId, schoolId, toast]);
  
  return { loading, approvalData };
};
