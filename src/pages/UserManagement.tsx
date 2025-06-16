import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Shield, 
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Navigate } from 'react-router-dom';

/**
 * Genişləndirilmiş İstifadəçi İdarəetmə Səhifəsi
 * SuperAdmin üçün tam istifadəçi idarəetmə sistemi
 */
const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const { hasRole } = usePermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Access control - yalnız SuperAdmin üçün
  if (!hasRole(['superadmin'])) {
    return <Navigate to="/users" replace />;
  }

  useEffect(() => {
    document.title = `${t('userManagement.title')} | InfoLine`;
  }, [t]);

  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('userManagement.title')}</h1>
            <p className="text-muted-foreground">
              {t('userManagement.description')}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('userManagement.export')}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {t('userManagement.import')}
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('userManagement.createUser')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('userManagement.stats.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-green-600">
                +8 bu ay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('userManagement.stats.activeUsers')}</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">
                91% aktiv
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('userManagement.stats.admins')}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Bütün admin türləri
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Son Girişlər</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-orange-600">
                Bu həftə daxilində
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('userManagement.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="users">{t('userManagement.tabs.users')}</TabsTrigger>
            <TabsTrigger value="roles">{t('userManagement.tabs.roles')}</TabsTrigger>
            <TabsTrigger value="permissions">{t('userManagement.tabs.permissions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rol Paylanması</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge variant="outline">SuperAdmin</Badge>
                    </span>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">Region Admin</Badge>
                    </span>
                    <span className="text-sm font-medium">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary">Sektor Admin</Badge>
                    </span>
                    <span className="text-sm font-medium">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <Badge variant="default">Məktəb Admin</Badge>
                    </span>
                    <span className="text-sm font-medium">132</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Son Aktivliklər</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Yeni məktəb admini yaradıldı</p>
                        <p className="text-xs text-muted-foreground">2 saat əvvəl</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sektor admin rolları yeniləndi</p>
                        <p className="text-xs text-muted-foreground">5 saat əvvəl</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Toplu istifadəçi ixracı aparıldı</p>
                        <p className="text-xs text-muted-foreground">1 gün əvvəl</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>İstifadəçi Siyahısı</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Axtarış
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrlə
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Ətraflı istifadəçi idarəetmə tablosu hazırlanır. Tezliklə axtarış, filtr, redaktə və silmə funksiyaları əlavə ediləcək.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Rol İdarəetməsi</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Rol idarəetmə sistemi hazırlanır. Rol yaratma, redaktə və icazə təyin etmə funksiyaları əlavə ediləcək.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>İcazə İdarəetməsi</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    İcazə idarəetmə sistemi hazırlanır. Granular icazələr və rol-əsaslı giriş nəzarəti təkmilləşdirilir.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle>Təkmil Funksiyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Toplu İstifadəçi Yaratma</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Rol Template-ləri</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex flex-col gap-2">
                <MoreHorizontal className="h-6 w-6" />
                <span>Audit Loqları</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;