
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface RegionAdmin {
  id: string;
  user_id: string;
  email: string;
  fullName: string;
  region_id?: string;
  regionName?: string;
}

export const useRegionAdmins = () => {
  const [admins, setAdmins] = useState<RegionAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRegionAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Burada real API çağırışı olacaq
      // Müvəqqəti olaraq boş massiv qaytarırıq
      // const response = await fetch('/api/admins/region');
      // const data = await response.json();
      // setAdmins(data);
      setAdmins([]);
    } catch (err: any) {
      console.error('Region adminləri yüklənərkən xəta:', err);
      setError(err.message || 'Region adminləri yüklənərkən xəta baş verdi');
      toast.error('Region adminləri yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegionAdmins();
  }, [fetchRegionAdmins]);

  return {
    admins,
    loading,
    error,
    refresh: fetchRegionAdmins
  };
};

export default useRegionAdmins;
