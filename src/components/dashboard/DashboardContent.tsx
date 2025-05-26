
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { LinksCard } from './school-admin/LinksCard';
import { FilesCard } from './school-admin/FilesCard';
import { RegionLinksCard } from './region-admin/RegionLinksCard';
import { RegionFilesCard } from './region-admin/RegionFilesCard';
import { SectorLinksCard } from './sector-admin/SectorLinksCard';
import { SectorFilesCard } from './sector-admin/SectorFilesCard';

/**
 * Dashboard əsas məzmunu komponenti
 * İstifadəçinin roluna görə fərqli məlumatlar göstərir
 */
const DashboardContent: React.FC = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { t } = useLanguage();

  const renderRoleSpecificContent = () => {
    if (!user || !user.id) {
      return <p>İstifadəçi məlumatları yüklənir...</p>;
    }

    switch (userRole) {
      case 'superadmin':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('systemOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('superadminDashboardDescription')}</p>
              </CardContent>
            </Card>
          </div>
        );

      case 'regionadmin':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('regionOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('regionadminDashboardDescription')}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RegionLinksCard />
              <RegionFilesCard />
            </div>
          </div>
        );

      case 'sectoradmin':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('sectorOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('sectoradminDashboardDescription')}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectorLinksCard />
              <SectorFilesCard />
            </div>
          </div>
        );

      case 'schooladmin':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('schoolOverview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('schooladminDashboardDescription')}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LinksCard />
              <FilesCard />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('welcome')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t('dashboardDescription')}</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
};

export default DashboardContent;
