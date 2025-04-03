
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, ChartBar, ClipboardList, Database, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  useEffect(() => {
    // İstifadəçi autentifikasiya olduqda və yüklənmə başa çatdıqda
    if (isAuthenticated && !isLoading) {
      // Dashboard-a yönləndir
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const featureCards = [
    {
      title: t('schools'),
      description: t('schoolsDescription'),
      icon: <School className="h-8 w-8 text-primary" />,
      path: "/schools"
    },
    {
      title: t('dataEntry'),
      description: t('dataEntryDescription'),
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      path: "/data-entry"
    },
    {
      title: t('reports'),
      description: t('reportsDescription'),
      icon: <ChartBar className="h-8 w-8 text-primary" />,
      path: "/reports"
    },
    {
      title: t('categories'),
      description: t('categoriesDescription'),
      icon: <Database className="h-8 w-8 text-primary" />,
      path: "/categories"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <p className="text-lg text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  // İstifadəçi daxil olmayıbsa, xoş gəldiniz səhifəsini göstərək
  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">{t('welcomeToInfoLine')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('infolineDescription')}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/login')} size="lg">
              {t('login')}
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

  return null; // İstifadəçi daxil olubsa və yüklənirsə, boş göstər
};

export default Index;
