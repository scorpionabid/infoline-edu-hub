
import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';
import { Toaster } from '@/components/ui/toaster';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

const DataEntry = () => {
  const location = useLocation();
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
    } else if (showAlert === 'newcategory') {
      toast({
        title: t('newCategoryAdded'),
        description: t('newCategoryAddedDesc'),
        variant: "default",
      });
    } else if (showAlert === 'rejected') {
      toast({
        title: t('formRejected'),
        description: t('formRejectedDesc'),
        variant: "destructive",
      });
    }
    
    // İlk dəfə səhifə açıldıqda xoş gəldiniz mesajı göstəririk
    if (!localStorage.getItem('dataEntryWelcomeSeen')) {
      setShowWelcome(true);
      localStorage.setItem('dataEntryWelcomeSeen', 'true');
    }
  }, [toast, showAlert, t]);
  
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
        <DataEntryContainer />
        <Toaster />
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
