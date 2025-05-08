
import { useState, useEffect } from 'react';

export interface DashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  completionRate: number;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    totalForms: 0,
    completedForms: 0,
    pendingForms: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      setData({
        totalForms: 12,
        completedForms: 7,
        pendingForms: 5,
        completionRate: 58.33
      });
      
      setLoading(false);
    };
    
    fetchData();
  }, []);
  
  return {
    data,
    loading,
    refreshData: () => {
      setLoading(true);
      setTimeout(() => {
        setData(prev => ({
          ...prev,
          completedForms: prev.completedForms + 1,
          pendingForms: prev.pendingForms - 1,
          completionRate: ((prev.completedForms + 1) / prev.totalForms) * 100
        }));
        setLoading(false);
      }, 500);
    }
  };
}

export default useDashboardData;
