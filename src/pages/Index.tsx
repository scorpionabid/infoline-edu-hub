import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ChartBar, ClipboardList, Database, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('Index səhifəsi yükləndi. İstifadəçi:', user?.role);
    if (isAuthenticated) {
      console.log('İstifadəçi daxil olub, dashboard-a yönləndirilir');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, user]);

  const featureCards = [
    {
      title: "Məktəb İdarəetməsi",
      description: "Məktəbləri əlavə edin, redaktə edin və idarə edin.",
      icon: <School className="h-8 w-8 text-primary" />,
      path: "/schools"
    },
    {
      title: "Məlumat Daxil Etmə",
      description: "Məktəb məlumatlarının daxil edilməsi və təsdiqlənməsi.",
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      path: "/data-entry"
    },
    {
      title: "Hesabatlar",
      description: "Məlumatların analizi və hesabatların yaradılması.",
      icon: <ChartBar className="h-8 w-8 text-primary" />,
      path: "/reports"
    },
    {
      title: "Kateqoriyalar",
      description: "Kateqoriyaların və sütunların idarə edilməsi.",
      icon: <Database className="h-8 w-8 text-primary" />,
      path: "/categories"
    }
  ];

  return (
    <SidebarLayout>
      <div className="container px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3">Dashboard-a yönləndirilir...</p>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Index;
