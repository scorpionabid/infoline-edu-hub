import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedReportData, AdvancedReportFilter, ReportTemplate } from '@/types/advanced-report';
import { toast } from 'sonner';
import { useRoleBasedReports } from './useRoleBasedReports';
import { SchoolPerformanceData, RegionalComparisonData, CategoryCompletionData } from './useReportsData';

export const useAdvancedReports = () => {
  const [reports, setReports] = useState<AdvancedReportData[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    getSchoolPerformanceReport,
    getRegionalComparisonReport,
    getCategoryCompletionReport,
    canAccessReportType,
    getAvailableTemplates,
    userRole
  } = useRoleBasedReports();

  const generateReport = async (
    templateId: string,
    filters: AdvancedReportFilter,
    customTitle?: string
  ): Promise<AdvancedReportData | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get template to determine report type
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Şablon tapılmadı');
      }

      // Check if user can access this report type
      if (!canAccessReportType(template.type)) {
        throw new Error('Bu hesabat növünə girmək icazəniz yoxdur');
      }

      // Convert AdvancedReportFilter to ReportsFilters format
      const reportFilters = {
        region_id: filters.regionId,
        sector_id: filters.sectorId,
        category_id: filters.categoryId,
        date_from: filters.dateRange?.from,
        date_to: filters.dateRange?.to,
      };

      let reportData: any[] = [];
      let insights: string[] = [];
      let recommendations: string[] = [];

      // Generate report based on template type with role-based filtering
      switch (template.type) {
        case 'performance':
          reportData = await getSchoolPerformanceReport(reportFilters);
          insights = generateSchoolPerformanceInsights(reportData);
          recommendations = generateSchoolPerformanceRecommendations(reportData);
          break;
        
        case 'comparison':
          if (!canAccessReportType('regional_comparison')) {
            throw new Error('Regional müqayisə hesabatına girmək icazəniz yoxdur');
          }
          reportData = await getRegionalComparisonReport({
            date_from: reportFilters.date_from,
            date_to: reportFilters.date_to,
          });
          insights = generateRegionalComparisonInsights(reportData);
          recommendations = generateRegionalComparisonRecommendations(reportData);
          break;
        
        case 'category':
          reportData = await getCategoryCompletionReport(reportFilters);
          insights = generateCategoryCompletionInsights(reportData);
          recommendations = generateCategoryCompletionRecommendations(reportData);
          break;

        case 'sector':
          if (userRole?.role === 'schooladmin') {
            throw new Error('Sektor hesabatına girmək icazəniz yoxdur');
          }
          // Use school performance data filtered by sector
          reportData = await getSchoolPerformanceReport(reportFilters);
          insights = generateSectorInsights(reportData);
          recommendations = generateSectorRecommendations(reportData);
          break;

        case 'school_detailed':
          // Detailed report for single school
          if (userRole?.role === 'schooladmin' && reportFilters.region_id !== userRole.region_id) {
            throw new Error('Bu məktəbin hesabatına girmək icazəniz yoxdur');
          }
          reportData = await getSchoolPerformanceReport(reportFilters);
          insights = generateSchoolDetailedInsights(reportData);
          recommendations = generateSchoolDetailedRecommendations(reportData);
          break;
        
        default:
          // Fallback to school performance report
          reportData = await getSchoolPerformanceReport(reportFilters);
          insights = generateSchoolPerformanceInsights(reportData);
          recommendations = generateSchoolPerformanceRecommendations(reportData);
      }

      const newReport: AdvancedReportData = {
        id: `report_${Date.now()}`,
        title: customTitle || `${template.name} - ${new Date().toLocaleDateString()}`,
        description: `${template.name} şablonu əsasında yaradılmış hesabat`,
        type: template.type as any,
        data: reportData,
        filters,
        generatedAt: new Date().toISOString(),
        generatedBy: userRole?.user_id || 'unknown',
        insights,
        recommendations,
        metadata: {
          totalRecords: reportData.length,
          dataSource: 'İnfoLine Database',
          lastUpdated: new Date().toISOString(),
          templateId: templateId,
          templateName: template.name,
          userRole: userRole?.role,
          appliedFilters: reportFilters
        }
      };

      setReports(prev => [newReport, ...prev]);
      toast.success('Hesabat uğurla yaradıldı');
      return newReport;
    } catch (err: any) {
      const errorMessage = err.message || 'Hesabat yaradılarkən xəta baş verdi';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // Get role-based templates
      const roleBasedTemplates = getAvailableTemplates();
      
      // Try to fetch from database if available
      try {
        const { data: dbTemplates, error: dbError } = await supabase
          .from('report_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) {
          console.warn('Could not fetch templates from database:', dbError);
          // Use only role-based templates if database query fails
          setTemplates(roleBasedTemplates);
          return;
        }

        // Filter database templates based on user role
        let availableTemplates = roleBasedTemplates;
        
        if (dbTemplates && dbTemplates.length > 0) {
          const dbTemplatesMapped = dbTemplates
            .filter(template => {
              // Filter based on user role
              const allowedRoles = template.config?.allowedRoles || ['superadmin'];
              return userRole && allowedRoles.includes(userRole.role);
            })
            .map(template => ({
              id: template.id,
              name: template.name,
              description: template.description || '',
              type: template.type,
              config: template.config || {},
              isPublic: true, // Default to public since we're filtering by role
              createdBy: template.created_by,
              createdAt: template.created_at
            }));
          
          // Merge with role-based templates
          availableTemplates = [...dbTemplatesMapped, ...roleBasedTemplates];
        }
        
        setTemplates(availableTemplates);
      } catch (dbErr: any) {
        console.warn('Database template fetch error:', dbErr);
        // Fallback to role-based templates only
        setTemplates(roleBasedTemplates);
      }
    } catch (err: any) {
      console.warn('Error in fetchTemplates, using role-based defaults:', err);
      setTemplates(getAvailableTemplates());
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'png'
  ) => {
    try {
      setLoading(true);
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Hesabat tapılmadı');
      }

      // TODO: Implement actual export functionality with role-based restrictions
      // For now, simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Hesabat ${format.toUpperCase()} formatında ixrac edildi`);
    } catch (err: any) {
      const errorMessage = err.message || 'İxrac zamanı xəta baş verdi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchTemplates();
    }
  }, [userRole]);

  return {
    reports,
    templates,
    loading,
    error,
    generateReport,
    exportReport,
    refreshTemplates: fetchTemplates,
    userRole
  };
};

// Insight generation functions for different report types
const generateSchoolPerformanceInsights = (data: SchoolPerformanceData[]): string[] => {
  if (!data || data.length === 0) return ['Məlumat tapılmadı'];

  const insights: string[] = [];
  
  const avgCompletion = data.reduce((sum, school) => sum + school.completion_rate, 0) / data.length;
  const highPerformers = data.filter(school => school.completion_rate >= 80).length;
  const lowPerformers = data.filter(school => school.completion_rate < 50).length;
  const topSchool = data.reduce((max, school) => 
    school.completion_rate > max.completion_rate ? school : max
  );
  
  insights.push(`Orta tamamlanma dərəcəsi ${avgCompletion.toFixed(1)}% təşkil edir`);
  insights.push(`${highPerformers} məktəb yüksək performans (80%+) göstərir`);
  
  if (lowPerformers > 0) {
    insights.push(`${lowPerformers} məktəb aşağı performans (50%-dən az) göstərir və diqqət tələb edir`);
  }
  
  insights.push(`Ən yüksək performans ${topSchool.completion_rate}% ilə ${topSchool.school_name} məktəbindədir`);
  
  return insights;
};

const generateSchoolPerformanceRecommendations = (data: SchoolPerformanceData[]): string[] => {
  if (!data || data.length === 0) return [];

  const recommendations: string[] = [];
  
  const lowPerformers = data.filter(school => school.completion_rate < 50);
  const highPerformers = data.filter(school => school.completion_rate >= 80);
  
  if (lowPerformers.length > 0) {
    recommendations.push('Aşağı performanslı məktəblər üçün əlavə dəstək və təlim proqramları təşkil etmək');
  }
  
  if (highPerformers.length > 0) {
    recommendations.push('Yüksək performanslı məktəblərin təcrübəsini digər məktəblərə ötürmək');
  }
  
  recommendations.push('Aylıq performans monitorinqi sistemi qurmaq');
  recommendations.push('Məktəblər arasında best practice-lərin paylaşılması üçün forum yaratmaq');
  
  return recommendations;
};

const generateRegionalComparisonInsights = (data: RegionalComparisonData[]): string[] => {
  if (!data || data.length === 0) return ['Məlumat tapılmadı'];

  const insights: string[] = [];
  
  const topRegion = data.reduce((max, region) => 
    region.avg_completion_rate > max.avg_completion_rate ? region : max
  );
  
  const totalSubmissions = data.reduce((sum, region) => sum + region.total_submissions, 0);
  const avgApprovalRate = data.reduce((sum, region) => sum + region.approval_rate, 0) / data.length;
  
  insights.push(`Ən yüksək orta tamamlanma dərəcəsi ${topRegion.avg_completion_rate}% ilə ${topRegion.region_name} regionundadır`);
  insights.push(`Ümumi ${totalSubmissions} təqdimat edilib`);
  insights.push(`Orta təsdiq dərəcəsi ${avgApprovalRate.toFixed(1)}% təşkil edir`);
  
  return insights;
};

const generateRegionalComparisonRecommendations = (data: RegionalComparisonData[]): string[] => {
  if (!data || data.length === 0) return [];

  const recommendations: string[] = [];
  
  recommendations.push('Regionlar arasında təcrübə mübadiləsi təşkil etmək');
  recommendations.push('Aşağı performanslı regionlar üçün xüsusi dəstək proqramları hazırlamaq');
  recommendations.push('Regional koordinatorların aylıq görüşlərini təşkil etmək');
  
  return recommendations;
};

const generateCategoryCompletionInsights = (data: CategoryCompletionData[]): string[] => {
  if (!data || data.length === 0) return ['Məlumat tapılmadı'];

  const insights: string[] = [];
  
  const avgCompletion = data.reduce((sum, cat) => sum + cat.completion_percentage, 0) / data.length;
  const completedCategories = data.filter(cat => cat.completion_percentage >= 90).length;
  const problematicCategories = data.filter(cat => cat.completion_percentage < 30).length;
  
  insights.push(`Orta kateqoriya tamamlanma dərəcəsi ${avgCompletion.toFixed(1)}%`);
  insights.push(`${completedCategories} kateqoriya yaxşı tamamlanıb (90%+)`);
  
  if (problematicCategories > 0) {
    insights.push(`${problematicCategories} kateqoriya aşağı tamamlanma dərəcəsinə sahib (30%-dən az)`);
  }
  
  return insights;
};

const generateCategoryCompletionRecommendations = (data: CategoryCompletionData[]): string[] => {
  if (!data || data.length === 0) return [];

  const recommendations: string[] = [];
  
  const problematicCategories = data.filter(cat => cat.completion_percentage < 30);
  
  if (problematicCategories.length > 0) {
    recommendations.push('Aşağı tamamlanma dərəcəsinə sahib kateqoriyalar üçün əlavə təlimat materialları hazırlamaq');
  }
  
  recommendations.push('Kateqoriya üzrə həftəlik xatırlatma sistemini aktivləşdirmək');
  recommendations.push('Məktəblərə kateqoriya əsaslı təlim webinarları təşkil etmək');
  
  return recommendations;
};

const generateSectorInsights = (data: SchoolPerformanceData[]): string[] => {
  if (!data || data.length === 0) return ['Məlumat tapılmadı'];

  const insights: string[] = [];
  
  // Group by sector
  const sectorGroups = data.reduce((acc, school) => {
    if (!acc[school.sector_name]) {
      acc[school.sector_name] = [];
    }
    acc[school.sector_name].push(school);
    return acc;
  }, {} as Record<string, SchoolPerformanceData[]>);

  Object.entries(sectorGroups).forEach(([sectorName, schools]) => {
    const avgCompletion = schools.reduce((sum, school) => sum + school.completion_rate, 0) / schools.length;
    insights.push(`${sectorName} sektorunda orta tamamlanma dərəcəsi ${avgCompletion.toFixed(1)}%`);
  });
  
  return insights;
};

const generateSectorRecommendations = (data: SchoolPerformanceData[]): string[] => {
  const recommendations: string[] = [];
  
  recommendations.push('Sektor daxilində məktəblər arasında təcrübə paylaşımı təşkil etmək');
  recommendations.push('Sektor səviyyəsində performans monitorinqi sistemi qurmaq');
  
  return recommendations;
};

const generateSchoolDetailedInsights = (data: SchoolPerformanceData[]): string[] => {
  if (!data || data.length === 0) return ['Məlumat tapılmadı'];

  const school = data[0]; // Single school detailed report
  const insights: string[] = [];
  
  insights.push(`Məktəbin ümumi tamamlanma dərəcəsi ${school.completion_rate}%`);
  insights.push(`Ümumi ${school.total_entries} təqdimat edilib`);
  insights.push(`Təsdiq dərəcəsi ${school.approval_rate}%`);
  
  if (school.pending_entries > 0) {
    insights.push(`${school.pending_entries} təqdimat təsdiq gözləyir`);
  }
  
  return insights;
};

const generateSchoolDetailedRecommendations = (data: SchoolPerformanceData[]): string[] => {
  if (!data || data.length === 0) return [];

  const school = data[0];
  const recommendations: string[] = [];
  
  if (school.completion_rate < 80) {
    recommendations.push('Tamamlanma dərəcəsini artırmaq üçün əlavə təlimlərin keçirilməsi');
  }
  
  if (school.pending_entries > 0) {
    recommendations.push('Gözləyən təqdimatların yoxlanılması və tamamlanması');
  }
  
  recommendations.push('Məktəb daxilində dövri performans yoxlamaları keçirmək');
  
  return recommendations;
};
