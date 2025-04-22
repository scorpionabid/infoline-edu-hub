import React from 'react';
import { SuperAdminDashboardData, StatsItem, CategoryStat } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, School, Building2, MapPin, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData | null;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Skeleton className="h-40 col-span-full lg:col-span-2" />
        <Skeleton className="h-40 col-span-full lg:col-span-1" />
        <Skeleton className="h-40 col-span-full md:col-span-1" />
        <Skeleton className="h-80 col-span-full xl:col-span-2" />
        <Skeleton className="h-40 col-span-full" />
      </div>
    );
  }
  
  // Kateqoriyaları tamamlanma faizinə görə sıralayırıq
  const sortedCategories = data.categories ? 
    [...data.categories].sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0)) : 
    [];
  
  return (
    <div className="space-y-6">
      {/* Əsas başlıq */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('refresh')}
          </Button>
          <select className="border rounded px-2 py-1 text-sm">
            <option>Bu ay</option>
            <option>Keçən ay</option>
            <option>Son 3 ay</option>
          </select>
        </div>
      </div>
      
      {/* Ümumi statistika */}
      <div className="text-sm text-muted-foreground">
        {t('totalSchools')}: {data.stats?.schools || 0} | {t('activeUsers')}: {data.stats?.users || 0}
      </div>
      
      {/* Əsas məzmun */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kateqoriyalar üzrə tamamlanma - sol tərəf */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('categoryCompletionRate')}</CardTitle>
              <CardDescription>{t('categoryCompletionRateDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((category) => (
                  <div key={category.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{category.name}</span>
                      <span className="font-medium">{category.completionRate || 0}%</span>
                    </div>
                    <Progress value={category.completionRate || 0} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {t('noCategoriesFound')}
                </div>
              )}
              
              <Button variant="outline" className="w-full mt-4">
                {t('showAllCategories')}
              </Button>
            </CardContent>
          </Card>
          
          {/* Aktivlik qrafiki */}
          <Card>
            <CardHeader>
              <CardTitle>{t('systemActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                {t('activityDataLoading')}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sağ tərəf - statistika və bildirişlər */}
        <div className="space-y-6">
          {/* Tamamlanma faizi */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('completionRate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{data.completionRate || 0}%</div>
                <Progress value={data.completionRate || 0} className="h-2 mt-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {t('needsAttention')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Gözləyən təsdiqlər */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>{t('pendingApprovals')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.pendingApprovals && data.pendingApprovals.length > 0 ? (
                <div className="space-y-2">
                  {data.pendingApprovals.slice(0, 3).map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <p className="font-medium">{item.title}</p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{item.schoolName}</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {data.pendingApprovals.length > 3 && (
                    <Button variant="link" className="w-full">
                      {t('viewAllPendingItems')} ({data.pendingApprovals.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {t('noPendingApprovals')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Ümumi statistika kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-blue-700">{t('totalRegions')}</h3>
            <p className="text-3xl font-bold text-blue-800">{data.stats?.regions || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-purple-700">{t('totalSectors')}</h3>
            <p className="text-3xl font-bold text-purple-800">{data.stats?.sectors || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-green-700">{t('totalSchools')}</h3>
            <p className="text-3xl font-bold text-green-800">{data.stats?.schools || 0}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <h3 className="text-amber-700">{t('totalUsers')}</h3>
            <p className="text-3xl font-bold text-amber-800">{data.stats?.users || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
