
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalData {
  id: string;
  categoryId: string;
  categoryName: string;
  columnId: string;
  columnName: string;
  schoolId?: string;
  schoolName?: string;
  sectorId?: string;
  sectorName?: string;
  submittedBy: string;
  submittedDate: string;
  status: ApprovalStatus;
  value: string;
}

export interface UseApprovalDataReturn {
  data: ApprovalData[];
  loading: boolean;
  error: Error | null;
  loadData: (status?: ApprovalStatus) => Promise<void>;
  approveItem: (id: string) => Promise<boolean>;
  rejectItem: (id: string, reason: string) => Promise<boolean>;
}

export const useApprovalData = (): UseApprovalDataReturn => {
  const [data, setData] = useState<ApprovalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const loadData = async (status: ApprovalStatus = 'pending') => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock data yükləmək əvəzinə, API çağırışı edə bilərsiniz
      // Burada müvəqqəti mock data istifadə edirik, ancaq real implementasiyada
      // bu, Supabase və ya başqa bir API çağırışı ilə əvəz olunmalıdır
      console.log(`Loading approval data with status: ${status}`);
      
      // API çağırışı simulyasiyası
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockData: ApprovalData[] = [];
      setData(mockData);
    } catch (err) {
      console.error('Error loading approval data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // İlkin yükləmə
  useEffect(() => {
    loadData();
  }, []);

  const approveItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // API çağırışı simulyasiyası
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Approving item with ID: ${id}`);
      
      // Data-nı yenilə
      setData(prevData => 
        prevData.filter(item => item.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error approving item:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectItem = async (id: string, reason: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // API çağırışı simulyasiyası
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Rejecting item with ID: ${id}, Reason: ${reason}`);
      
      // Data-nı yenilə
      setData(prevData => 
        prevData.filter(item => item.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error rejecting item:', err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    loadData,
    approveItem,
    rejectItem
  };
};
