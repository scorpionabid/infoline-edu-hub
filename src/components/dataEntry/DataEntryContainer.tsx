
import React from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { SectorDataEntry } from './SectorDataEntry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';

export const DataEntryContainer: React.FC = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);

  // Handle authentication check
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <Lock className="h-5 w-5" />
              Giriş Tələb olunur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Məlumat daxil etmə bölməsinə daxil olmaq üçün sistemə giriş etməlisiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle role-based access
  if (!['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center text-orange-800">
              <AlertCircle className="h-5 w-5" />
              İcazə Yoxdur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Bu bölməyə daxil olmaq üçün müvafiq icazələriniz yoxdur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render appropriate component based on user role
  switch (user.role) {
    case 'sectoradmin':
      return <SectorDataEntry />;
    
    case 'regionadmin':
    case 'superadmin':
      // For now, redirect to sector data entry as well
      // TODO: Implement RegionDataEntry and SuperAdminDataEntry components
      return <SectorDataEntry />;
    
    case 'schooladmin':
      // TODO: Implement SchoolDataEntry component
      return (
        <Card>
          <CardHeader>
            <CardTitle>Məktəb Məlumat Daxil Etmə</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Məktəb administratoru paneli hazırlanmaqdadır...
            </p>
          </CardContent>
        </Card>
      );
    
    default:
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center text-red-800">
                <AlertCircle className="h-5 w-5" />
                Naməlum Rol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                İstifadəçi rolunuz müəyyən edilə bilmir.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
};

export default DataEntryContainer;
