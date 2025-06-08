import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportTypeValues, REPORT_TYPE_VALUES } from '@/types/report';

// Hesabat tipləri əsasında kateqoriyalar
type ReportCategory = 'statistics' | 'completion' | 'comparison' | 'progress' | 'performance';

export const useMockReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate mock reports
    const mockReports: Report[] = [
      {
        id: uuidv4(),
        title: 'Regional Completion Statistics Report',
        description: 'Overview of completion rates across all regions',
        type: REPORT_TYPE_VALUES.BAR,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'School Completion Report',
        description: 'Detailed analysis of form completion by schools',
        type: REPORT_TYPE_VALUES.TABLE,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Sector Comparison Report',
        description: 'Comparison between different sectors',
        type: REPORT_TYPE_VALUES.PIE,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Category Progress Report',
        description: 'Progress tracking for specific categories',
        type: REPORT_TYPE_VALUES.LINE,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      },
      {
        id: uuidv4(),
        title: 'Annual Performance Overview',
        description: 'Yearly performance metrics and trends',
        type: REPORT_TYPE_VALUES.METRICS,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
        content: {
          includeCharts: true
        }
      }
    ];
    
    // Simulate loading time
    setTimeout(() => {
      setReports(mockReports);
      setIsLoading(false);
    }, 500);
  }, []);

  const getMockReportByType = (type: ReportTypeValues): Report | undefined => {
    return reports.find(report => report.type === type);
  };
  
  const getMockReportByCategory = (category: ReportCategory): Report | undefined => {
    switch(category) {
      case 'statistics':
        return reports.find(report => report.type === REPORT_TYPE_VALUES.BAR);
      case 'completion':
        return reports.find(report => report.type === REPORT_TYPE_VALUES.TABLE);
      case 'comparison':
        return reports.find(report => report.type === REPORT_TYPE_VALUES.PIE);
      case 'progress':
        return reports.find(report => report.type === REPORT_TYPE_VALUES.LINE);
      case 'performance':
        return reports.find(report => report.type === REPORT_TYPE_VALUES.METRICS);
      default:
        return undefined;
    }
  };

  const generateMockDataForReport = (category: ReportCategory): any => {
    switch (category) {
      case 'statistics':
        return {
          regionData: [
            { name: 'Region 1', completionRate: 78, schools: 45 },
            { name: 'Region 2', completionRate: 65, schools: 32 },
            { name: 'Region 3', completionRate: 82, schools: 28 },
            { name: 'Region 4', completionRate: 90, schools: 15 },
            { name: 'Region 5', completionRate: 72, schools: 38 }
          ],
          totalAverage: 77.4,
          totalSchools: 158
        };
        
      case 'completion':
        return {
          schoolData: [
            { name: 'School A', completionRate: 95, categories: 12, pendingForms: 1 },
            { name: 'School B', completionRate: 88, categories: 12, pendingForms: 2 },
            { name: 'School C', completionRate: 76, categories: 12, pendingForms: 5 },
            { name: 'School D', completionRate: 64, categories: 12, pendingForms: 7 },
            { name: 'School E', completionRate: 98, categories: 12, pendingForms: 0 }
          ]
        };
        
      case 'comparison':
        return {
          sectorData: [
            { name: 'Sector 1', completionRate: 82, schools: 28, performance: 76 },
            { name: 'Sector 2', completionRate: 79, schools: 22, performance: 81 },
            { name: 'Sector 3', completionRate: 88, schools: 18, performance: 84 },
            { name: 'Sector 4', completionRate: 72, schools: 25, performance: 68 }
          ],
          averages: {
            completionRate: 80.25,
            performance: 77.25
          }
        };
        
      case 'progress':
        return {
          categoryData: [
            { name: 'Infrastructure', startValue: 45, currentValue: 78, target: 90 },
            { name: 'Academic Performance', startValue: 58, currentValue: 72, target: 85 },
            { name: 'Teacher Training', startValue: 62, currentValue: 89, target: 95 },
            { name: 'Student Engagement', startValue: 51, currentValue: 69, target: 80 },
            { name: 'Administrative Efficiency', startValue: 38, currentValue: 83, target: 90 }
          ],
          overallProgress: 74.7,
          targetCompletion: '87.2%'
        };
        
      case 'performance':
        return {
          yearlyData: [
            { year: '2020', performance: 65, enrollment: 8200, budget: 120000 },
            { year: '2021', performance: 72, enrollment: 8500, budget: 135000 },
            { year: '2022', performance: 78, enrollment: 8800, budget: 142000 },
            { year: '2023', performance: 84, enrollment: 9100, budget: 160000 },
            { year: '2024', performance: 89, enrollment: 9300, budget: 175000 }
          ],
          growthRate: '37%',
          enrollmentGrowth: '13.4%'
        };
        
      default:
        return {};
    }
  };

  return {
    reports,
    isLoading,
    error,
    getMockReportByType,
    getMockReportByCategory,
    generateMockDataForReport
  };
};

export default useMockReports;
