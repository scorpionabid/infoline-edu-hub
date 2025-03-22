import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bell, School, FileBarChart, CheckCircle, AlertCircle, Clock, Users, Map, Globe, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockData = {
  superadmin: {
    regions: 15,
    sectors: 45,
    schools: 634,
    users: 912,
    completionRate: 78,
    pendingApprovals: 23,
    notifications: [
      { id: 1, type: 'newCategory', title: 'New Category Created', message: 'Student information category has been created', time: '10 min ago' },
      { id: 2, type: 'formApproved', title: 'Form Approved', message: 'School 45 form has been approved', time: '2 hours ago' },
      { id: 3, type: 'systemUpdate', title: 'System Update', message: 'System will be updated on June 15, 2023', time: '1 day ago' },
    ]
  },
  regionadmin: {
    sectors: 8,
    schools: 126,
    users: 158,
    completionRate: 72,
    pendingApprovals: 18,
    pendingSchools: 34,
    approvedSchools: 82,
    rejectedSchools: 10,
    notifications: [
      { id: 1, type: 'dueDateReminder', title: 'Due Date Reminder', message: 'School facilities data due in 3 days', time: '30 min ago' },
      { id: 2, type: 'formRejected', title: 'Form Rejected', message: 'School 23 form requires corrections', time: '5 hours ago' },
    ]
  },
  sectoradmin: {
    schools: 24,
    completionRate: 68,
    pendingApprovals: 12,
    pendingSchools: 8,
    approvedSchools: 14,
    rejectedSchools: 2,
    notifications: [
      { id: 1, type: 'formApproved', title: 'Form Approved', message: 'School 12 form has been approved', time: '1 hour ago' },
      { id: 2, type: 'dueDateReminder', title: 'Due Date Reminder', message: 'Teacher qualifications data due tomorrow', time: '3 hours ago' },
    ]
  },
  schooladmin: {
    forms: {
      pending: 3,
      approved: 12,
      rejected: 1,
      dueSoon: 2,
      overdue: 0,
    },
    completionRate: 85,
    notifications: [
      { id: 1, type: 'formRejected', title: 'Form Rejected', message: 'Infrastructure form requires corrections', time: '45 min ago' },
      { id: 2, type: 'dueDateReminder', title: 'Due Date Reminder', message: 'Student attendance data due in 2 days', time: '4 hours ago' },
    ]
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  
  const renderDashboardContent = () => {
    if (!user) return null;
    
    switch(user.role) {
      case 'superadmin':
        return renderSuperAdminDashboard();
      case 'regionadmin':
        return renderRegionAdminDashboard();
      case 'sectoradmin':
        return renderSectorAdminDashboard();
      case 'schooladmin':
        return renderSchoolAdminDashboard();
      default:
        return null;
    }
  };
  
  const renderSuperAdminDashboard = () => {
    const data = mockData.superadmin;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title={t('totalRegions')}
            value={data.regions}
            icon={<Map className="h-5 w-5 text-blue-500" />}
            color="blue"
          />
          <StatsCard 
            title={t('totalSectors')}
            value={data.sectors}
            icon={<Globe className="h-5 w-5 text-purple-500" />}
            color="purple"
          />
          <StatsCard 
            title={t('totalSchools')}
            value={data.schools}
            icon={<School className="h-5 w-5 text-green-500" />}
            color="green"
          />
          <StatsCard 
            title={t('totalUsers')}
            value={data.users}
            icon={<Users className="h-5 w-5 text-amber-500" />}
            color="amber"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('completionRate')}</CardTitle>
              <CardDescription>Overall data submission rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{data.completionRate}%</span>
                  <Badge variant={data.completionRate > 75 ? "success" : data.completionRate > 50 ? "warning" : "destructive"}>
                    {data.completionRate > 75 ? "Good" : data.completionRate > 50 ? "Average" : "Needs Attention"}
                  </Badge>
                </div>
                <Progress value={data.completionRate} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Completed: {data.completionRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted"></div>
                    <span>Remaining: {100 - data.completionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('pendingApprovals')}</CardTitle>
              <CardDescription>Forms waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{data.pendingApprovals}</span>
                  <Badge variant={data.pendingApprovals < 10 ? "success" : data.pendingApprovals < 30 ? "warning" : "destructive"}>
                    {data.pendingApprovals < 10 ? "Low" : data.pendingApprovals < 30 ? "Medium" : "High"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                    <span className="text-sm font-medium">Today</span>
                    <span className="text-xl font-bold">8</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <Clock className="h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-xl font-bold">15</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                    <span className="text-sm font-medium">Older</span>
                    <span className="text-xl font-bold">{data.pendingApprovals - 23}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
            <CardDescription>Recent system events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderRegionAdminDashboard = () => {
    const data = mockData.regionadmin;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title={t('sectors')}
            value={data.sectors}
            icon={<Globe className="h-5 w-5 text-purple-500" />}
            color="purple"
          />
          <StatsCard 
            title={t('schools')}
            value={data.schools}
            icon={<School className="h-5 w-5 text-green-500" />}
            color="green"
          />
          <StatsCard 
            title={t('users')}
            value={data.users}
            icon={<Users className="h-5 w-5 text-amber-500" />}
            color="amber"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('completionRate')}</CardTitle>
              <CardDescription>Region data submission rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{data.completionRate}%</span>
                  <Badge variant={data.completionRate > 75 ? "success" : data.completionRate > 50 ? "warning" : "destructive"}>
                    {data.completionRate > 75 ? "Good" : data.completionRate > 50 ? "Average" : "Needs Attention"}
                  </Badge>
                </div>
                <Progress value={data.completionRate} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Completed: {data.completionRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted"></div>
                    <span>Remaining: {100 - data.completionRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('pendingApprovals')}</CardTitle>
              <CardDescription>Forms waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{data.pendingApprovals}</span>
                  <Badge variant={data.pendingApprovals < 10 ? "success" : data.pendingApprovals < 20 ? "warning" : "destructive"}>
                    {data.pendingApprovals < 10 ? "Low" : data.pendingApprovals < 20 ? "Medium" : "High"}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
                    <span className="text-sm font-medium">Today</span>
                    <span className="text-xl font-bold">6</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <Clock className="h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-xl font-bold">10</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
                    <span className="text-sm font-medium">Older</span>
                    <span className="text-xl font-bold">{data.pendingApprovals - 16}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
            <CardDescription>Recent events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderSectorAdminDashboard = () => {
    const data = mockData.sectoradmin;
    
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
            <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
            <CardDescription>Recent events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderSchoolAdminDashboard = () => {
    const data = mockData.schooladmin;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatsCard 
            title={t('pendingForms')}
            value={data.forms.pending}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            color="amber"
          />
          <StatsCard 
            title={t('approvedForms')}
            value={data.forms.approved}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            color="green"
          />
          <StatsCard 
            title={t('rejectedForms')}
            value={data.forms.rejected}
            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
            color="red"
          />
          <StatsCard 
            title={t('dueSoon')}
            value={data.forms.dueSoon}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
            color="blue"
          />
          <StatsCard 
            title={t('overdue')}
            value={data.forms.overdue}
            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
            color={data.forms.overdue > 0 ? "red" : "green"}
          />
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('completionRate')}</CardTitle>
            <CardDescription>School data submission rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{data.completionRate}%</span>
                <Badge variant={data.completionRate > 75 ? "success" : data.completionRate > 50 ? "warning" : "destructive"}>
                  {data.completionRate > 75 ? "Good" : data.completionRate > 50 ? "Average" : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={data.completionRate} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Completed: {data.completionRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Remaining: {100 - data.completionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('latestNotifications')}</CardTitle>
            <CardDescription>Recent events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const StatsCard = ({ title, value, icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20',
      green: 'bg-green-50 dark:bg-green-900/20',
      amber: 'bg-amber-50 dark:bg-amber-900/20',
      red: 'bg-red-50 dark:bg-red-900/20',
      purple: 'bg-purple-50 dark:bg-purple-900/20',
    };
    
    return (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`border-l-4 ${color === 'blue' ? 'border-l-blue-500' : color === 'green' ? 'border-l-green-500' : color === 'amber' ? 'border-l-amber-500' : color === 'red' ? 'border-l-red-500' : 'border-l-purple-500'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{title}</p>
                <div className="text-2xl font-bold">{value}</div>
              </div>
              <div className={`p-2 rounded-full ${colorClasses[color]}`}>
                {icon}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  const NotificationItem = ({ notification }) => {
    const { type, title, message, time } = notification;
    
    const getIcon = () => {
      switch(type) {
        case 'newCategory':
          return <FileText className="h-5 w-5 text-blue-500" />;
        case 'formApproved':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'formRejected':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'dueDateReminder':
          return <Clock className="h-5 w-5 text-amber-500" />;
        case 'systemUpdate':
          return <Bell className="h-5 w-5 text-purple-500" />;
        default:
          return <Bell className="h-5 w-5 text-muted-foreground" />;
      }
    };
    
    return (
      <div className="flex items-start gap-4 p-3 rounded-md hover:bg-muted/50 transition-colors">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
      </div>
    );
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('welcomeBack')}, {user?.name}</p>
          </div>
        </div>
        
        {renderDashboardContent()}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
