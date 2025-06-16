import React from 'react';

import SchoolColumnDataTable from '@/components/reports/SchoolColumnDataTable';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Info } from 'lucide-react';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  
  const { 
    userRole, 
    loading: roleLoading, 
    error: roleError,
    getPermissionsSummary
  } = useRoleBasedReports();

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

  return (
    <>
      <Helmet>
        <title>{t('reports')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-3 space-y-4">
        <div className="space-y-4">

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
          
          {/* Only Məktəb-Sütun Məlumatları component */}
          <SchoolColumnDataTable />
        </div>
      </div>
    </>
  );
};

export default Reports;
