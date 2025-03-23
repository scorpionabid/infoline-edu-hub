
import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const DataEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showWelcome, setShowWelcome] = useState(false);
  
  // URL-dən categoryId parametrini alırıq
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
      // ki, səhifəni yenidən açanda yenə göstərilməsin
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'newcategory') {
      toast({
        title: t('newCategoryAdded'),
        description: t('newCategoryAddedDesc'),
        variant: "default",
      });
      
      // Alert göstərildikdən sonra URL-dən alert parametrini təmizləyək
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    } else if (showAlert === 'rejected') {
      toast({
        title: t('formRejected'),
        description: t('formRejectedDesc'),
        variant: "destructive",
      });
      
      // Alert göstərildikdən sonra URL-dən alert parametrini təmizləyək
      const newParams = new URLSearchParams(queryParams);
      newParams.delete('alert');
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
    }
    
    // İlk dəfə səhifə açıldıqda xoş gəldiniz mesajı göstəririk
    if (!localStorage.getItem('dataEntryWelcomeSeen')) {
      setShowWelcome(true);
      localStorage.setItem('dataEntryWelcomeSeen', 'true');
    }
  }, [toast, showAlert, t, navigate, location.pathname, queryParams]);
  
  useEffect(() => {
    if (showWelcome) {
      toast({
        title: t('welcomeToDataEntry'),
        description: t('welcomeToDataEntryDesc'),
        duration: 5000,
      });
    }
  }, [showWelcome, toast, t]);

  return (
    <>
      <Helmet>
        <title>{t('dataEntry')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <DataEntryContainer initialCategoryId={categoryId} />
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
