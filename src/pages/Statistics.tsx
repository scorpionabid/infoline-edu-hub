
import React, { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  School, 
  Building2, 
  Users, 
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - gerçək data ilə əvəz ediləcək
const mockRegionStats = {
  totalSectors: 12,
  totalSchools: 240,
  completionRate: 67,
  pendingApprovals: 45,
  activeForms: 8,
  lastUpdated: new Date().toLocaleDateString('az-AZ')
};

const mockSectorStats = {
  totalSchools: 24,
  completionRate: 73,
  pendingApprovals: 8,
  activeForms: 3,
  schoolsCompleted: 18,
  schoolsPending: 6,
  lastUpdated: new Date().toLocaleDateString('az-AZ')
};

const StatisticsPage: React.FC = () => {
  const { t } = useLanguage();
  const { hasRole } = usePermissions();
  
  const isRegionAdmin = hasRole(['regionadmin']);
  const isSectorAdmin = hasRole(['sectoradmin']);
  
  const stats = isRegionAdmin ? mockRegionStats : mockSectorStats;
  const pageTitle = isRegionAdmin ? 'Region Statistikası' : 'Sektor Statistikası';
  
  // Set document title
  useEffect(() => {
    document.title = `${pageTitle} | InfoLine`;
  }, [pageTitle]);
  
  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="text-muted-foreground">
              Son yenilənmə: {stats.lastUpdated}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            Canlı Məlumatlar
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isRegionAdmin && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ümumi Sektorlar</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSectors}</div>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +2 bu ay
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ümumi Məktəblər</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">
                {isRegionAdmin ? 'Region daxilində' : 'Sektor daxilində'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanma Faizi</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <Progress value={stats.completionRate} className="mt-2" />
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5% bu həftə
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gözləyən Təsdiqlər</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
              <p className="text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Təcili baxış tələb olunur
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Ümumi Baxış</TabsTrigger>
            <TabsTrigger value="schools">Məktəblər</TabsTrigger>
            <TabsTrigger value="forms">Formlar</TabsTrigger>
            <TabsTrigger value="trends">Tendensiyalar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Məlumat Doldurulma Statusu</CardTitle>
                  <CardDescription>
                    {isRegionAdmin ? 'Region' : 'Sektor'} üzrə tamamlanma səviyyələri
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tamamlanmış</span>
                      <span>{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Davam edən</span>
                      <span>{100 - stats.completionRate}%</span>
                    </div>
                    <Progress value={100 - stats.completionRate} className="h-2 bg-orange-100" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktiv Formlar</CardTitle>
                  <CardDescription>
                    Hazırda doldurulması gözlənilən form sayı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{stats.activeForms}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Təsdiqlənmiş
                      </span>
                      <span>142</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 text-yellow-500 mr-1" />
                        Gözləmədə
                      </span>
                      <span>{stats.pendingApprovals}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <CardTitle>Məktəb Performansı</CardTitle>
                <CardDescription>
                  Məktəblərin məlumat doldurma performansı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    Məktəb səviyyəli statistika hazırlanır. Tezliklə əlavə ediləcək.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Form Statistikası</CardTitle>
                <CardDescription>
                  Form növləri üzrə məlumat doldurulma nəticələri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <PieChart className="h-4 w-4" />
                  <AlertDescription>
                    Form əsaslı analitika hazırlanır. Tezliklə əlavə ediləcək.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Tendensiya Analizi</CardTitle>
                <CardDescription>
                  Vaxt seriyası və tendensiya məlumatları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Tendensiya analizi və qrafiklər hazırlanır. Tezliklə əlavə ediləcək.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StatisticsPage;
