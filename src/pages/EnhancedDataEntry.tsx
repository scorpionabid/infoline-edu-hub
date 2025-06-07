
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { default as SectorDataEntry } from '@/components/dataEntry/SectorDataEntry';
import { ProgressTracking } from '@/components/progress/ProgressTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { School, TrendingUp, Bell, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const EnhancedDataEntry: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schools');

  const handleDataEntry = (schoolId: string) => {
    console.log('EnhancedDataEntry: Navigate to data entry for school:', schoolId);
    toast.success(`Məktəb ${schoolId} üçün məlumat daxil etmə açıldı`);
    // The SectorAdminSchoolList will handle showing the data entry form
  };

  const handleSendNotification = (schoolIds: string[]) => {
    console.log('Send notification to schools:', schoolIds);
    toast.success('Bildiriş göndərildi');
  };

  const handleBulkAction = (action: string, schoolIds: string[]) => {
    console.log('Bulk action:', action, 'for schools:', schoolIds);
    toast.success(`${action} əməliyyatı yerinə yetirildi`);
  };

  const handleSchoolClick = (schoolId: string) => {
    handleDataEntry(schoolId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
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
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <Calendar className="h-4 w-4 mr-2" />
            Parametrlər
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schools">Məktəb İdarəetməsi</TabsTrigger>
          <TabsTrigger value="progress">Proqres İzləmə</TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="space-y-4">
          <SectorDataEntry
            onDataEntry={handleDataEntry}
            onSendNotification={handleSendNotification}
            onBulkAction={handleBulkAction}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ProgressTracking onSchoolClick={handleSchoolClick} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDataEntry;
