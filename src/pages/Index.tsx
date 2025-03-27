
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ChartBar, ClipboardList, Database, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('Index səhifəsi yükləndi. İstifadəçi:', user?.role);
    console.log('İstifadəçi autentifikasiya vəziyyəti:', isAuthenticated ? 'Daxil olub' : 'Daxil olmayıb');
    console.log('Yüklənir:', isLoading);

    // İstifadəçi artıq daxil olubsa və yüklənmə tamamlanıbsa
    if (isAuthenticated && !isLoading && !redirecting) {
      console.log('İstifadəçi daxil olub, dashboard-a yönləndirilir');
      setRedirecting(true);
      
      // Timeout əlavə edək ki, state yenilənsin və sonra yönləndirək
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigate, user, redirecting]);

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

  // İstifadəçi daxil olmayıbsa, xoş gəldiniz səhifəsini göstərək
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container px-4 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">InfoLine Təhsil İdarəetmə Sistemi</h1>
          <p className="text-xl text-muted-foreground">
            Azərbaycanda məktəblərdən statistik məlumatların toplanması, analizi və hesabatlandırılması üçün mərkəzləşdirilmiş platforma
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/login')} size="lg">
              Daxil Ol
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {featureCards.map((card, index) => (
            <Card key={index} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {card.icon}
                  <CardTitle>{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Yüklənir vəziyyəti və ya yönləndirmə prosesi
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-lg text-muted-foreground">{redirecting ? "Dashboard-a yönləndirilir..." : "Yüklənir..."}</p>
      </div>
    </div>
  );
};

export default Index;
