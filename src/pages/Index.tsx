
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ChartBar, ClipboardList, Database, School } from 'lucide-react';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">InfoLine - Məktəb Məlumatları İdarəetmə Sistemi</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Azərbaycan məktəbləri üçün mərkəzləşdirilmiş məlumat toplama, analiz və hesabat platforması
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featureCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-2">{card.icon}</div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(card.path)}
                >
                  Keçid et <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sistemə Xoş Gəlmisiniz</CardTitle>
            <CardDescription>İnfoLine məktəb məlumatlarının idarə edilməsi üçün yaradılmış platformadır</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Bu platforma məktəblərdən statistik məlumatların toplanması, analiz edilməsi və hesabatların hazırlanması üçün nəzərdə tutulub.
              Sistem SuperAdmin, Region admini, Sektor admini və Məktəb admini rollarını dəstəkləyir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Dashboard-a Keçid <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button onClick={() => navigate('/data-entry')} variant="outline" className="w-full">
                Məlumat Daxil Et <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default Index;
