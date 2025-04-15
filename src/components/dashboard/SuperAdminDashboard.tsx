import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SuperAdminDashboardData } from '@/types/dashboard';
import StatusCards from './common/StatusCards';
import NotificationsCard from './common/NotificationsCard';
import RegionsList from './super-admin/RegionsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, PieChart } from 'lucide-react';

interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();

  // Bu obyektləri güvənli şəkildə işləyək: data və onun alt xüsusiyyətləri mövcud olduğuna əmin olmalıyıq
  const regionStats = data?.regionStats || [];
  const notifications = data?.notifications || [];
  const formsByStatus = data?.formsByStatus || { pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={data?.stats || []}
        completionRate={data?.completionRate || 0}
        regions={data?.regions || 0}
        sectors={data?.sectors || 0}
        schools={data?.schools || 0}
        pendingApprovals={data?.pendingApprovals || 0}
      />
      
      {/* Əsas məlumatların görüntülənməsi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Regionların siyahısı */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {t('regions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionStats.map((region) => (
                <div key={region.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{region.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('sectors')}: {region.sectorCount}, {t('schools')}: {region.schoolCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{region.completionRate}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${region.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Form statusları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              {t('formStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-medium">{t('pending')}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">{formsByStatus.pending} {t('forms')}</p>
                  <span className="text-yellow-600 font-medium">{formsByStatus.pending}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">{t('approved')}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">{formsByStatus.approved} {t('forms')}</p>
                  <span className="text-green-600 font-medium">{formsByStatus.approved}</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">{t('rejected')}</p>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">{formsByStatus.rejected} {t('forms')}</p>
                  <span className="text-red-600 font-medium">{formsByStatus.rejected}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
