
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { SectorAdminSchoolList } from '@/components/schools/SectorAdminSchoolList';
import { School, Building2, BarChart3 } from 'lucide-react';

export const SectorDataEntry: React.FC = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [activeTab, setActiveTab] = useState('schools');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="flex-shrink-0 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Sektor Məlumat İdarəetməsi
            {user?.role === 'sectoradmin' && (
              <Badge className="bg-blue-100 text-blue-800">
                Sektor Administratoru
              </Badge>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            Sektorunuza aid məktəblərin məlumatlarını idarə edin və ya birbaşa sektor məlumatlarını daxil edin
          </p>
        </CardHeader>
      </Card>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 grid w-full grid-cols-2">
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Məktəblər
            </TabsTrigger>
            <TabsTrigger value="sector" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sektor Məlumatları
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-hidden">
            <TabsContent value="schools" className="h-full mt-0">
              <SectorAdminSchoolList />
            </TabsContent>

            <TabsContent value="sector" className="h-full mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Sektor Səviyyəsində Məlumat Daxil Etmə</CardTitle>
                  <p className="text-muted-foreground">
                    Bu bölmə tezliklə əlavə ediləcək - sektor səviyyəsində məlumatlar üçün
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Sektor Məlumatları</p>
                    <p>Bu funksionallıq hazırlanmaqdadır</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SectorDataEntry;
