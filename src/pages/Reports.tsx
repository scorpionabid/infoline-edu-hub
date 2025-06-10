import React, { useState } from 'react';
import ReportHeader from '@/components/reports/ReportHeader';
import { ReportList } from '@/components/reports/ReportList';
import SchoolColumnTable from '@/components/reports/SchoolColumnTable';
import ReportDashboard from '@/components/reports/advanced/ReportDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Info } from 'lucide-react';

interface FilterState {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  category_id?: string;
}

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("advanced");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({});
  
  const { 
    userRole, 
    loading: roleLoading, 
    error: roleError,
    canAccessReportType,
    getPermissionsSummary
  } = useRoleBasedReports();

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setFilters(prev => ({ ...prev, category_id: categoryId }));
  };

  // Show loading state while determining user role
  if (roleLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>İstifadəçi icazələri yoxlanılır...</span>
        </div>
      </div>
    );
  }

  // Show error if role couldn't be determined
  if (roleError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            İstifadəçi rolunu müəyyən etmək mümkün olmadı: {roleError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get permissions summary
  const permissions = getPermissionsSummary();

  // Determine available tabs based on user role
  const getAvailableTabs = () => {
    const tabs = [];
    
    // Advanced reporting - available for all roles
    tabs.push({
      id: 'advanced',
      label: t("advancedReporting"),
      component: <ReportDashboard />
    });

    // School column reports - available for all roles
    tabs.push({
      id: 'schools-columns',
      label: t("schoolColumnReportTitle"),
      component: <SchoolColumnTable categoryId={selectedCategoryId} />
    });

    // All reports/templates - available for all roles
    tabs.push({
      id: 'templates',
      label: t("allReports"),
      component: <ReportList />
    });

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  return (
    <>
      <Helmet>
        <title>{t('reports')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-3 space-y-4">
        <div className="space-y-4">
          <ReportHeader 
            onCategorySelect={handleCategorySelect}
            onFiltersChange={handleFiltersChange}
          />

          {/* Role-based access info */}
          {permissions && permissions.role !== 'superadmin' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Giriş səlahiyyəti:</strong> {permissions.role} kimi sistemə daxil olmusunuz.
                {permissions.restrictions.region_id && (
                  <span> Region məhdudiyyəti aktiv.</span>
                )}
                {permissions.restrictions.sector_id && (
                  <span> Sektor məhdudiyyəti aktiv.</span>
                )}
                {permissions.restrictions.school_id && (
                  <span> Məktəb məhdudiyyəti aktiv.</span>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
              {availableTabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {availableTabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Reports;
