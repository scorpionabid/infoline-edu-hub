import React, { useState } from 'react';
import { 
  School, 
  FileBarChart, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileCheck,
  FileX,
  ChevronRight,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsCard from './StatsCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from '@/types/notification';

// Mock data for schools
const mockSchoolsData = [
  { id: 1, name: "28 nömrəli məktəb", status: "pending", completionRate: 75 },
  { id: 2, name: "42 nömrəli məktəb", status: "approved", completionRate: 100 },
  { id: 3, name: "12 nömrəli məktəb", status: "pending", completionRate: 60 },
  { id: 4, name: "117 nömrəli məktəb", status: "rejected", completionRate: 45 },
  { id: 5, name: "45 nömrəli məktəb", status: "pending", completionRate: 30 },
];

// Mock data for categories completion
const mockCategoriesData = [
  { name: "Tədris məlumatları", completionRate: 72, color: "bg-blue-500" },
  { name: "Müəllim məlumatları", completionRate: 58, color: "bg-green-500" },
  { name: "İnfrastruktur məlumatları", completionRate: 43, color: "bg-amber-500" },
  { name: "Maliyyə məlumatları", completionRate: 29, color: "bg-purple-500" },
];

// Mock data for pending approvals
const mockPendingApprovals = [
  { id: 1, schoolName: "28 nömrəli məktəb", category: "Tədris məlumatları", submitted: "2023-10-12", formCount: 3 },
  { id: 2, schoolName: "12 nömrəli məktəb", category: "Müəllim məlumatları", submitted: "2023-10-14", formCount: 2 },
  { id: 3, schoolName: "45 nömrəli məktəb", category: "İnfrastruktur məlumatları", submitted: "2023-10-15", formCount: 1 },
];

// Mock data for activity
const mockActivity = [
  { id: "a1", action: "Məlumatlar təsdiqləndi", target: "28 nömrəli məktəb", time: "2 saat əvvəl" },
  { id: "a2", action: "Məlumatlar rədd edildi", target: "45 nömrəli məktəb", time: "4 saat əvvəl" },
  { id: "a3", action: "Bildiriş göndərildi", target: "Bütün məktəblərə", time: "dünən" },
];

interface SectorAdminDashboardProps {
  data: {
    schools: number;
    completionRate: number;
    pendingApprovals: number;
    pendingSchools: number;
    approvedSchools: number;
    rejectedSchools: number;
    notifications: Notification[];
  };
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schools');
  
  const handleViewReports = () => {
    navigate('/reports');
  };
  
  const handleSchoolClick = (schoolId: number) => {
    // Navigate to school data entry page
    navigate('/data-entry');
  };
  
  const handleSendNotification = () => {
    // Show notification sent toast
    console.log('Notification sent to schools');
  };
  
  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
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
      
      {/* School Status Cards */}
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
      
      {/* Main Content Tabs */}
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
            
            {/* Schools Tab Content */}
            <TabsContent value="schools" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('schoolsInSector')}</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSendNotification}
                >
                  {t('sendNotification')}
                </Button>
              </div>
              
              <div className="space-y-3">
                {mockSchoolsData.map(school => (
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
                      {school.status === 'pending' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Gözləmədə</Badge>
                      )}
                      {school.status === 'approved' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Təsdiqlənib</Badge>
                      )}
                      {school.status === 'rejected' && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rədd edilib</Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Categories Tab Content */}
            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('categoryCompletionRates')}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewReports}
                >
                  <FileBarChart className="mr-2 h-4 w-4" />
                  {t('viewReports')}
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockCategoriesData.map((category, index) => (
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
            </TabsContent>
            
            {/* Approvals Tab Content */}
            <TabsContent value="approvals" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('pendingApprovals')}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/data-entry')}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  {t('reviewAll')}
                </Button>
              </div>
              
              {mockPendingApprovals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('noPendingApprovals')}</p>
              ) : (
                <div className="space-y-3">
                  {mockPendingApprovals.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => navigate('/data-entry')}
                    >
                      <div>
                        <div className="font-medium">{item.schoolName}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-right">
                          <div>{item.formCount} form</div>
                          <div className="text-xs text-muted-foreground">{item.submitted}</div>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <FileCheck className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <FileX className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Activity Tab Content */}
            <TabsContent value="activity" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium">{t('recentActivity')}</h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportActivityLog')}
                </Button>
              </div>
              
              <div className="space-y-4">
                {mockActivity.map(activity => (
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SectorAdminDashboard;
