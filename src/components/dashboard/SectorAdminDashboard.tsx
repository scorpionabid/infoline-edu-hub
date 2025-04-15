
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SectorAdminDashboardData } from '@/types/dashboard';
import NotificationsCard from './NotificationsCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import StatusCards from './StatusCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Schools, Activity } from 'lucide-react';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();

  // Bu obyektləri güvənli şəkildə işləyək: data və onun alt xüsusiyyətləri mövcud olduğuna əmin olmalıyıq
  const pendingItems = data?.pendingItems || [];
  const schoolStats = data?.schoolStats || [];
  const notifications = data?.notifications || [];
  const activityLog = data?.activityLog || [];

  return (
    <div className="space-y-6">
      <StatusCards 
        stats={data?.stats || []}
        completionRate={data?.completionRate || 0}
        schools={data?.schools || 0}
        sectorRate={data?.completionRate || 0}
        pendingApprovals={data?.pendingApprovals || 0}
      />
      
      {/* Əsas məlumatların görüntülənməsi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Məktəblərin siyahısı */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Schools className="mr-2 h-5 w-5" />
              {t('schools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schoolStats.map((school) => (
                <div key={school.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{t('pendingItems')}: {school.pending}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{school.completionRate}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${school.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Təsdiq gözləyən elementlər */}
        <PendingApprovalsCard pendingItems={pendingItems} />
      </div>
      
      {/* Alt bölmə */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aktivlik jurnalı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              {t('activityLog')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.target}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Bildirişlər */}
        <NotificationsCard notifications={notifications} />
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
