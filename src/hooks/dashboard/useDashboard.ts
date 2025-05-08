
import { useState, useEffect } from 'react';
import { SchoolAdminDashboardData } from '@/types/dashboard';

export function useDashboard(schoolId?: string) {
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!schoolId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData: SchoolAdminDashboardData = {
          status: {
            pending: 5,
            approved: 15,
            rejected: 2,
            total: 22,
            active: 20,
            inactive: 2
          },
          formStats: {
            pending: 5,
            approved: 15,
            rejected: 2,
            draft: 3,
            dueSoon: 4,
            overdue: 1,
            total: 30
          },
          completion: {
            percentage: 70,
            total: 10,
            completed: 7
          },
          categories: [
            {
              id: '1',
              name: 'School Assessment',
              completionRate: 80,
              status: 'active'
            },
            {
              id: '2',
              name: 'Teacher Evaluation',
              completionRate: 60,
              status: 'active'
            }
          ],
          upcoming: [
            {
              id: '1',
              categoryName: 'School Assessment',
              deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
              completionRate: 80,
              status: 'active'
            }
          ],
          pendingForms: [
            {
              id: '1',
              name: 'Monthly Report',
              categoryName: 'School Assessment',
              status: 'pending'
            }
          ],
          notifications: [
            {
              id: '1',
              title: 'Form approval required',
              message: 'A new form submission needs your approval',
              type: 'approval',
              date: new Date().toISOString(),
              isRead: false,
              priority: 'high'
            }
          ]
        };
        
        setData(mockData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [schoolId]);
  
  return {
    data,
    loading,
    error,
    refresh: () => {
      // Implement refresh logic if needed
    }
  };
}

export default useDashboard;
