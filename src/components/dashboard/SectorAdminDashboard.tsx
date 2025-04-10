
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Notification } from '@/types/notification';
import NotificationsCard from './NotificationsCard';
import { 
  School, 
  FileBarChart, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileCheck,
  FileX,
  ChevronRight,
  Download,
  Send,
  BarChart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsCard from './StatsCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

interface CategoryCompletionItem {
  name: string;
  completionRate: number;
  color: string;
}

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  time: string;
}

interface PendingApprovalItem {
  id: string;
  school: string;
  category: string;
  date: string;
}

interface SectorAdminDashboardProps {
  data: {
    schools: number;
    completionRate: number;
    pendingApprovals: number;
    pendingSchools: number;
    approvedSchools: number;
    rejectedSchools: number;
    notifications: Notification[];
    schoolStats?: { id: string; name: string; completionRate: number; pending: number }[];
    pendingItems?: PendingApprovalItem[];
    categoryCompletion?: CategoryCompletionItem[];
    activityLog?: ActivityItem[];
  };
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schools');
  
  const handleViewReports = () => {
    navigate('/reports');
  };
  
  const handleSchoolClick = (schoolId: string) => {
    navigate(`/schools/${schoolId}/data`);
  };
  
  const handleSendNotification = () => {
    toast.success('Bildiriş bütün məktəblərə göndərildi', {
      description: 'Məktəb adminləri bildirişi qısa zamanda alacaqlar'
    });
  };
  
  const handleApprove = (itemId: string) => {
    toast.success('Məlumat təsdiqləndi', {
      description: 'Məlumat uğurla təsdiqləndi'
    });
  };
  
  const handleReject = (itemId: string) => {
    toast.success('Məlumat rədd edildi', {
      description: 'Məlumat uğurla rədd edildi'
    });
  };
  
  const handleExportActivity = () => {
    toast.success('Aktivlik jurnalı ixrac edilir', {
      description: 'Fayl hazırlanır, tezliklə yüklənəcək'
    });
  };
  
  // Məlumatların təşkil olub-olmadığını yoxla
  const hasSchoolStats = data.schoolStats && data.schoolStats.length > 0;
  const hasPendingItems = data.pendingItems && data.pendingItems.length > 0;
  const hasCategoryData = data.categoryCompletion && data.categoryCompletion.length > 0;
  const hasActivityData = data.activityLog && data.activityLog.length > 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={t('schools')}
          value={data.schools}
          icon={<School className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('completionRate')}
          value={`${data.completionRate}%`}
          icon={<FileBarChart className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('pendingApprovals')}
          value={data.pendingApprovals}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          color="amber"
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
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('sectorData')}</CardTitle>
          <CardDescription>{t('sectorDataDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="schools">{t('schools')}</TabsTrigger>
              <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
              <TabsTrigger value="approvals">{t('approvals')}</TabsTrigger>
              <TabsTrigger value="activity">{t('activity')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schools" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('schoolsInSector')}</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSendNotification}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t('sendNotification')}
                </Button>
              </div>
              
              {hasSchoolStats ? (
                <div className="space-y-3">
                  {data.schoolStats.map(school => (
                    <div 
                      key={school.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleSchoolClick(school.id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{school.name}</span>
                        <div className="flex items-center mt-1">
                          <Progress value={school.completionRate} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground ml-2">{school.completionRate}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {school.pending > 0 && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {school.pending} gözləyir
                          </Badge>
                        )}
                        {school.completionRate === 100 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Tamamlanıb</Badge>
                        )}
                        {school.completionRate === 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Başlanmayıb</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <School className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>{t('noSchoolsFound')}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('categoryCompletionRates')}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewReports}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  {t('viewReports')}
                </Button>
              </div>
              
              {hasCategoryData ? (
                <div className="space-y-4">
                  {data.categoryCompletion.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="font-medium">{category.completionRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className={`${category.color} h-2.5 rounded-full`} 
                          style={{ width: `${category.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <FileBarChart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>{t('noCategoriesFound')}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approvals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('pendingApprovals')}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/data-entries')}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  {t('reviewAll')}
                </Button>
              </div>
              
              {hasPendingItems ? (
                <div className="space-y-3">
                  {data.pendingItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted"
                    >
                      <div>
                        <div className="font-medium">{item.school}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <div>{item.date}</div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleApprove(item.id)}
                            title="Təsdiqlə"
                          >
                            <FileCheck className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleReject(item.id)}
                            title="Rədd et"
                          >
                            <FileX className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>{t('noPendingApprovals')}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('recentActivity')}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportActivity}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportActivityLog')}
                </Button>
              </div>
              
              {hasActivityData ? (
                <div className="space-y-4">
                  {data.activityLog.map(activity => (
                    <div 
                      key={activity.id} 
                      className="flex justify-between items-start border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">{activity.target}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>{t('noRecentActivity')}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SectorAdminDashboard;
