
import { useState } from 'react';
import { Report, ReportType } from '@/types/dashboard';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'School Performance Overview',
      description: 'Overview of school performance metrics',
      type: 'statistics' as ReportType,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'System'
    },
    {
      id: '2',
      title: 'Completion Rates by Region',
      description: 'Comparison of completion rates across regions',
      type: 'completion' as ReportType,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'System'
    },
    {
      id: '3',
      title: 'Quarterly Comparison',
      description: 'Comparison of metrics across quarters',
      type: 'comparison' as ReportType,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'System'
    }
  ]);
  
  return { reports };
}

export default useReports;
