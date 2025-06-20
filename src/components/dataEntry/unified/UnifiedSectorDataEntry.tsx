
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, School, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UnifiedSectorDataEntryProps {
  className?: string;
}

export const UnifiedSectorDataEntry: React.FC<UnifiedSectorDataEntryProps> = ({
  className = ''
}) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock data for demonstration
      setSchools([
        { id: '1', name: 'Məktəb 1', status: 'completed', completionRate: 100 },
        { id: '2', name: 'Məktəb 2', status: 'in_progress', completionRate: 65 },
        { id: '3', name: 'Məktəb 3', status: 'pending', completionRate: 30 },
      ]);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          İstifadəçi məlumatları tapılmadı. Zəhmət olmasa yenidən giriş edin.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('loading')}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <School className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            {t('sectorDataEntry') || 'Sektor Məlumat Girişi'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bu sektor üçün heç bir məktəb tapılmadı.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {schools.map((school) => (
                  <Card key={school.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(school.status)}
                          <div>
                            <h3 className="font-medium">{school.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Tamamlanma: {school.completionRate}%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(school.status)}
                          >
                            {school.status === 'completed' && 'Tamamlandı'}
                            {school.status === 'in_progress' && 'Davam edir'}
                            {school.status === 'pending' && 'Gözləyir'}
                          </Badge>
                          
                          <Button variant="outline" size="sm">
                            {t('view') || 'Bax'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedSectorDataEntry;
