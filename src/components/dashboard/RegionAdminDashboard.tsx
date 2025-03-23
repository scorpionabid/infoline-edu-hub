
import React from 'react';
import { School, Users, Map, Globe, CheckCircle, AlertCircle, Clock, FileBarChart, Database, Layers } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import PendingApprovalsCard from './PendingApprovalsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface RegionAdminDashboardProps {
  data: {
    sectors: number;
    schools: number;
    users: number;
    completionRate: number;
    pendingApprovals: number;
    pendingSchools: number;
    approvedSchools: number;
    rejectedSchools: number;
    notifications: Notification[];
    categories: {
      name: string;
      completionRate: number;
      color: string;
    }[];
    sectorCompletions: {
      name: string;
      completionRate: number;
    }[];
  };
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('sectors')}
          value={data.sectors}
          icon={<Globe className="h-5 w-5 text-purple-500" />}
          color="purple"
          onClick={() => navigate('/sectors')}
        />
        <StatsCard 
          title={t('schools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
          onClick={() => navigate('/schools')}
        />
        <StatsCard 
          title={t('users')}
          value={data.users}
          icon={<Users className="h-5 w-5 text-amber-500" />}
          color="amber"
          onClick={() => navigate('/users')}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate} 
          description={t('regionDataSubmissionRate')}
        />
        <PendingApprovalsCard 
          pendingApprovals={data.pendingApprovals}
          todayCount={6}
          weekCount={10}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('pendingSchools')}
          value={data.pendingSchools}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        <StatsCard 
          title={t('approvedSchools')}
          value={data.approvedSchools}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('rejectedSchools')}
          value={data.rejectedSchools}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kateqoriyalar üzrə tamamlanma statistikası */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{t('categoryCompletion')}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={() => navigate('/categories')}
              >
                <Layers className="h-4 w-4 mr-1" />
                {t('viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categories.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.completionRate}%</span>
                  </div>
                  <Progress value={category.completionRate} className={`h-2 ${category.color}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sektorlar üzrə tamamlanma statistikası */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{t('sectorCompletion')}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={() => navigate('/sectors')}
              >
                <Globe className="h-4 w-4 mr-1" />
                {t('viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.sectorCompletions.map((sector, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sector.name}</span>
                    <span className="text-sm text-muted-foreground">{sector.completionRate}%</span>
                  </div>
                  <Progress value={sector.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{t('quickActions')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="flex flex-col h-24 p-4" variant="outline" onClick={() => navigate('/schools')}>
                <School className="h-6 w-6 mb-2" />
                <span>{t('manageSchools')}</span>
              </Button>
              <Button className="flex flex-col h-24 p-4" variant="outline" onClick={() => navigate('/users')}>
                <Users className="h-6 w-6 mb-2" />
                <span>{t('manageUsers')}</span>
              </Button>
              <Button className="flex flex-col h-24 p-4" variant="outline" onClick={() => navigate('/categories')}>
                <Layers className="h-6 w-6 mb-2" />
                <span>{t('manageCategories')}</span>
              </Button>
              <Button className="flex flex-col h-24 p-4" variant="outline" onClick={() => navigate('/reports')}>
                <FileBarChart className="h-6 w-6 mb-2" />
                <span>{t('viewReports')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default RegionAdminDashboard;
