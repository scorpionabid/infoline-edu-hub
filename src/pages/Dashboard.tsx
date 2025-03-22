
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import RegionAdminDashboard from '@/components/dashboard/RegionAdminDashboard';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';
import { toast } from 'sonner';

// Genişləndirilmiş mock məlumatlar
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
    ],
    activityData: [
      { name: 'Jan', value: 65 },
      { name: 'Feb', value: 78 },
      { name: 'Mar', value: 67 },
      { name: 'Apr', value: 89 },
      { name: 'May', value: 92 },
      { name: 'Jun', value: 87 },
      { name: 'Jul', value: 94 },
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
    ],
    activityData: [
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 58 },
      { name: 'Mar', value: 47 },
      { name: 'Apr', value: 79 },
      { name: 'May', value: 82 },
      { name: 'Jun', value: 77 },
      { name: 'Jul', value: 84 },
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
    ],
    activityData: [
      { name: 'Jan', value: 35 },
      { name: 'Feb', value: 48 },
      { name: 'Mar', value: 37 },
      { name: 'Apr', value: 69 },
      { name: 'May', value: 72 },
      { name: 'Jun', value: 67 },
      { name: 'Jul', value: 74 },
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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Demo məlumatlar üçün yükləmə effekti
    const timer = setTimeout(() => {
      setIsLoading(false);
      // İstifadəçiyə salamlama bildirişi
      toast.success(t('welcomeBack'), {
        description: `${user?.name}, ${t('dashboard')} yenilənib.`
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, t]);
  
  const renderDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (!user) return null;
    
    switch(user.role) {
      case 'superadmin':
        return <SuperAdminDashboard data={mockData.superadmin} />;
      case 'regionadmin':
        return <RegionAdminDashboard data={mockData.regionadmin} />;
      case 'sectoradmin':
        return <SectorAdminDashboard data={mockData.sectoradmin} />;
      case 'schooladmin':
        return <SchoolAdminDashboard data={mockData.schooladmin} />;
      default:
        return null;
    }
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-8">
        <DashboardHeader />
        {renderDashboardContent()}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
