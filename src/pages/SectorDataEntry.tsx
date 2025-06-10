import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorOnlyDataEntry } from '@/components/dataEntry/SectorOnlyDataEntry';
import { ProgressTracking } from '@/components/progress/ProgressTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  School, 
  TrendingUp, 
  Bell, 
  Calendar,
  BarChart3,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Genişləndirilmiş Sektor Məlumat Daxil Etmə Səhifəsi
 * EnhancedDataEntry funksionallığı ilə birləşdirilmiş
 * Yalnız sektor adminləri üçün - sektor məlumatlarını daxil etmək və idarə etmək üçün
 */
const SectorDataEntry: React.FC = () => {
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('data-entry');

  // Access control - yalnız sektor adminləri üçün
  if (user?.role !== 'sectoradmin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDataEntry = (schoolId: string) => {
    console.log('SectorDataEntry: Navigate to data entry for school:', schoolId);
    toast.success(`Məktəb ${schoolId} üçün məlumat daxil etmə açıldı`);
    // Navigate to school data entry
    navigate(`/data-entry/${schoolId}`);
  };

  const handleSendNotification = (schoolIds: string[]) => {
    console.log('Send notification to schools:', schoolIds);
    toast.success(`${schoolIds.length} məktəbə bildiriş göndərildi`);
  };

  const handleBulkAction = (action: string, schoolIds: string[]) => {
    console.log('Bulk action:', action, 'for schools:', schoolIds);
    toast.success(`${action} əməliyyatı ${schoolIds.length} məktəb üçün yerinə yetirildi`);
  };

  const handleSchoolClick = (schoolId: string) => {
    handleDataEntry(schoolId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sektor Admin Panel</h1>
          <p className="text-muted-foreground">Məktəb məlumatlarını idarə edin və proqresi izləyin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Hesabatlar
          </Button>
          <Button variant="outline" onClick={() => navigate('/statistics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistika
          </Button>
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <Calendar className="h-4 w-4 mr-2" />
            Parametrlər
          </Button>
        </div>
      </div>

      {/* Quick Stats from EnhancedDataEntry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi məktəblər</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Sektorunuzda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orta doldurma</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-green-600">
              +12% bu həftə
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiv bildirişlər</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Bu həftə göndərilən
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son tarix</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-orange-600">
              Gün qalıb
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs with improved content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data-entry">Məlumat Daxil Etmə</TabsTrigger>
          <TabsTrigger value="schools">Məktəb İdarəetməsi</TabsTrigger>
          <TabsTrigger value="progress">Proqres İzləmə</TabsTrigger>
        </TabsList>

        <TabsContent value="data-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Sektor Məlumatları Daxil Etmə
              </CardTitle>
              <p className="text-muted-foreground">
                Sektorunuza aid məlumatları daxil edin və idarə edin
              </p>
            </CardHeader>
            <CardContent>
              <SectorOnlyDataEntry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Məktəb İdarəetməsi</CardTitle>
              <p className="text-muted-foreground">
                Sektorunuza aid məktəbləri idarə edin və onların məlumat doldurma statusunu izləyin
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Məktəb idarəetmə paneli hazırlanır...</p>
                <p className="text-sm mt-2">Tezliklə məktəb siyahısı, bildiriş göndərmə və toplu əməliyyatlar əlavə ediləcək.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Proqres İzləmə
              </CardTitle>
              <p className="text-muted-foreground">
                Məktəblərin məlumat doldurma proqresini real vaxtda izləyin
              </p>
            </CardHeader>
            <CardContent>
              <ProgressTracking onSchoolClick={handleSchoolClick} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Tez Əməliyyatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/approvals')}
            >
              <CheckCircle className="h-6 w-6" />
              <span>Təsdiqlər</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Hesabatlar</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => {
                toast.info('Bildiriş paneli hazırlanır...');
              }}
            >
              <Bell className="h-6 w-6" />
              <span>Bildirişlər</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectorDataEntry;