import React from 'react';
import { School, FileBarChart, Users, Map, Globe, Activity, PieChart, BarChart, Database, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface SuperAdminDashboardProps {
  data: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    completionRate: number;
    pendingApprovals: number;
    notifications: Notification[];
    activityData?: Array<{
      name: string;
      value: number;
    }>;
  };
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const activityData = data.activityData || [
    { name: 'Yan', value: 20 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'İyn', value: 43 },
    { name: 'İyl', value: 50 },
  ];
  
  const regionSchoolsData = [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const categoryCompletionData = [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
  ];
  
  const navigateToRegions = () => navigate('/regions');
  const navigateToSectors = () => navigate('/sectors');
  const navigateToSchools = () => navigate('/schools');
  const navigateToUsers = () => navigate('/users');
  const navigateToReports = () => navigate('/reports');
  const navigateToCategories = () => navigate('/categories');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title={t('totalRegions')}
          value={data.regions}
          icon={<Map className="h-5 w-5 text-blue-500" />}
          color="blue"
          onClick={navigateToRegions}
        />
        <StatsCard 
          title={t('totalSectors')}
          value={data.sectors}
          icon={<Globe className="h-5 w-5 text-purple-500" />}
          color="purple"
          onClick={navigateToSectors}
        />
        <StatsCard 
          title={t('totalSchools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
          onClick={navigateToSchools}
        />
        <StatsCard 
          title={t('totalUsers')}
          value={data.users}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          color="amber"
          onClick={navigateToUsers}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard completionRate={data.completionRate} />
        <PendingApprovalsCard pendingApprovals={data.pendingApprovals} />
      </div>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            {t('systemActivity')}
          </TabsTrigger>
          <TabsTrigger value="regions">
            <PieChart className="h-4 w-4 mr-2" />
            Bölgələr üzrə statistika
          </TabsTrigger>
          <TabsTrigger value="categories">
            <BarChart className="h-4 w-4 mr-2" />
            Kateqoriyalar üzrə tamamlanma
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('systemActivity')}</CardTitle>
              <CardDescription>Sistem aktivliyi statistikası</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activityData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Son 7 ay üzrə məlumat aktivliyi
              </div>
              <Button variant="outline" size="sm" onClick={navigateToReports}>
                <FileBarChart className="mr-2 h-4 w-4" />
                Ətraflı hesabatlar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bölgələr üzrə məktəb paylanması</CardTitle>
              <CardDescription>Hər bölgə üzrə məktəb sayı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={regionSchoolsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {regionSchoolsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={navigateToRegions}>
                <Map className="mr-2 h-4 w-4" />
                Bütün bölgələri göstər
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kateqoriyalar üzrə tamamlanma</CardTitle>
              <CardDescription>Hər kateqoriya üçün məlumat doldurlması faizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryCompletionData.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-medium">{category.completed}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${category.completed}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={navigateToCategories}>
                <Database className="mr-2 h-4 w-4" />
                Bütün kateqoriyaları göstər
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SuperAdminDashboard;
