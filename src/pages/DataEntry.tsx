
import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryForm from '@/components/dataEntry/DataEntryForm';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload } from 'lucide-react';

const DataEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // URL-dən parametrləri alırıq
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get('categoryId');
  const showAlert = queryParams.get('alert');
  
  useEffect(() => {
    // Əgər URL-də alert parametri varsa, müvafiq bildiriş göstəririk
    if (showAlert === 'deadline') {
      toast({
        title: t('deadlineApproaching'),
        description: t('deadlineApproachingDesc'),
        variant: "default",
      });
      
      // Alert göstərildikdən sonra URL-dən alert parametrini təmizləyək
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'newcategory') {
      toast({
        title: t('newCategoryAdded'),
        description: t('newCategoryAddedDesc'),
        variant: "default",
      });
      
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'rejected') {
      toast({
        title: t('formRejected'),
        description: t('formRejectedDesc'),
        variant: "destructive",
      });
      
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }
  }, [toast, showAlert, t, navigate, location.pathname, queryParams]);

  return (
    <>
      <Helmet>
        <title>{t('dataEntry')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t('dataEntry')}</h1>
              <p className="text-muted-foreground mt-1">{t('schoolInfoInstructions')}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload size={16} />
                {t('uploadExcel')}
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileSpreadsheet size={16} />
                {t('excelTemplate')}
              </Button>
            </div>
          </div>
          
          <DataEntryForm initialCategoryId={categoryId} />
        </div>
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
