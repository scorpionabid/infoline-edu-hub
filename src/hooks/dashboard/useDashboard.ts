
import { useState, useCallback } from 'react';

interface DashboardItem {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'completed' | 'upcoming' | 'overdue';
  deadline?: string;
  progress?: number;
}

export function useDashboard() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockItems: DashboardItem[] = [
        {
          id: '1',
          name: 'School Infrastructure Report',
          status: 'pending',
          deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
          progress: 45,
        },
        {
          id: '2',
          name: 'Teacher Evaluation',
          status: 'completed',
          deadline: new Date(Date.now() - 86400000 * 2).toISOString(),
          progress: 100,
        },
        {
          id: '3',
          name: 'Student Achievement Data',
          status: 'draft',
          deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
          progress: 15,
        },
        {
          id: '4',
          name: 'Annual Resource Allocation',
          status: 'pending',
          deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          progress: 60,
        },
      ];
      
      setItems(mockItems);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    items,
    loading,
    error,
    loadDashboard
  };
}

export default useDashboard;
