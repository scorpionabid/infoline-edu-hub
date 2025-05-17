
import { useState } from 'react';
import { Report } from '@/types/report';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'School Performance Overview',
      description: 'Overview of school performance metrics',
      type: 'bar',
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'System',
      status: 'draft'
    },
    {
      id: '2',
      title: 'Completion Rates by Region',
      description: 'Comparison of completion rates across regions',
      type: 'pie',
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'System',
      status: 'draft'
    },
    {
      id: '3',
      title: 'Quarterly Comparison',
      description: 'Comparison of metrics across quarters',
      type: 'line',
      content: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'System',
      status: 'draft'
    }
  ]);
  
  // Create a new report
  const createReport = async (reportData: { title: string; description: string; type: string }) => {
    try {
      const newReport: Report = {
        id: Math.random().toString(36).substring(2, 9),
        title: reportData.title,
        description: reportData.description,
        type: reportData.type as any,
        content: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user',
        status: 'draft'
      };
      
      // In a real app, this would make an API call
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };
  
  return { 
    reports,
    createReport
  };
}

export default useReports;
