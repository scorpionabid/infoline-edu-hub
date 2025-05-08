import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApprovalData {
  pendingApprovals: any[];
  loading: boolean;
  error: any;
}

export const useApprovalData = (): ApprovalData => {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: approvals, error: approvalsError } = await supabase
          .from('data_entries')
          .select(`
            id,
            form_id,
            school_id,
            category_id,
            submitted_at,
            status,
            school:schools (name),
            category:categories (name)
          `)
          .eq('status', 'pending');

        if (approvalsError) {
          throw new Error(approvalsError.message);
        }

        // Fetch additional details for regions and sectors
        const schoolIds = [...new Set(approvals.map(approval => approval.school_id))];
        const categoryIds = [...new Set(approvals.map(approval => approval.category_id))];

        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id, name, sector_id, region_id');

        if (schoolsError) {
          throw new Error(schoolsError.message);
        }

        const { data: sectors, error: sectorsError } = await supabase
          .from('sectors')
          .select('id, name, region_id');

        if (sectorsError) {
          throw new Error(sectorsError.message);
        }

        const { data: regionsWithSectors, error: regionsWithSectorsError } = await supabase
          .from('regions')
          .select('id, name, sectors(id, name)');

        if (regionsWithSectorsError) {
          throw new Error(regionsWithSectorsError.message);
        }

        const enrichedApprovals = approvals.map(approval => {
          const school = schools.find(s => s.id === approval.school_id);
          const category = approval.category;
          const regions = regionsWithSectors?.filter(r => r.id === school?.region_id);
          const regionName = regions?.length > 0 && regions[0]?.name ? regions[0].name : '';
          const sectorName = sectors?.length > 0 && sectors[0]?.name ? sectors[0].name : '';
          const sectorRegionName = regionsWithSectors?.length > 0 && regionsWithSectors[0]?.name 
            ? regionsWithSectors[0].name 
            : '';
          const sectorSectors = regionsWithSectors?.length > 0 && regionsWithSectors[0]?.sectors 
            ? regionsWithSectors[0].sectors 
            : [];

          return {
            ...approval,
            schoolName: school?.name || 'Unknown School',
            categoryName: category?.name || 'Unknown Category',
            regionName: regionName || 'Unknown Region',
            sectorName: sectorName || 'Unknown Sector',
            sectorRegionName: sectorRegionName || 'Unknown Region',
          };
        });

        setPendingApprovals(enrichedApprovals);
      } catch (err: any) {
        setError(err);
        toast({
          title: 'Error fetching pending approvals',
          description: err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, [toast]);

  return { pendingApprovals, loading, error };
};
