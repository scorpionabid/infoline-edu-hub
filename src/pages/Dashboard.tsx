
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
import { Loader2 } from 'lucide-react';

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
      { id: 1, type: 'newCategory', title: 'Yeni Kateqoriya', message: 'Şagird məlumatları kateqoriyası yaradılıb', time: '10 dəq əvvəl' },
      { id: 2, type: 'formApproved', title: 'Form Təsdiqləndi', message: '45 saylı məktəbin formu təsdiqləndi', time: '2 saat əvvəl' },
      { id: 3, type: 'systemUpdate', title: 'Sistem Yeniləməsi', message: 'Sistem 15 iyun 2023-cü il tarixində yenilənəcək', time: '1 gün əvvəl' },
    ],
    activityData: [
      { name: 'Yan', value: 65 },
      { name: 'Fev', value: 78 },
      { name: 'Mar', value: 67 },
      { name: 'Apr', value: 89 },
      { name: 'May', value: 92 },
      { name: 'İyun', value: 87 },
      { name: 'İyul', value: 94 },
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
      { id: 1, type: 'dueDateReminder', title: 'Son Tarix Xatırlatması', message: 'Məktəb inventarları məlumatları 3 gün ərzində təqdim edilməlidir', time: '30 dəq əvvəl' },
      { id: 2, type: 'formRejected', title: 'Form Rədd Edildi', message: '23 saylı məktəbin formu düzəlişlər tələb edir', time: '5 saat əvvəl' },
    ],
    activityData: [
      { name: 'Yan', value: 45 },
      { name: 'Fev', value: 58 },
      { name: 'Mar', value: 47 },
      { name: 'Apr', value: 79 },
      { name: 'May', value: 82 },
      { name: 'İyun', value: 77 },
      { name: 'İyul', value: 84 },
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
      { id: 1, type: 'formApproved', title: 'Form Təsdiqləndi', message: '12 saylı məktəbin formu təsdiqləndi', time: '1 saat əvvəl' },
      { id: 2, type: 'dueDateReminder', title: 'Son Tarix Xatırlatması', message: 'Müəllim kvalifikasiya məlumatları sabah təqdim edilməlidir', time: '3 saat əvvəl' },
    ],
    activityData: [
      { name: 'Yan', value: 35 },
      { name: 'Fev', value: 48 },
      { name: 'Mar', value: 37 },
      { name: 'Apr', value: 69 },
      { name: 'May', value: 72 },
      { name: 'İyun', value: 67 },
      { name: 'İyul', value: 74 },
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
      { id: 1, type: 'formRejected', title: 'Form Rədd Edildi', message: 'İnfrastruktur formu düzəlişlər tələb edir', time: '45 dəq əvvəl' },
      { id: 2, type: 'dueDateReminder', title: 'Son Tarix Xatırlatması', message: 'Şagird davamiyyət məlumatları 2 gün ərzində təqdim edilməlidir', time: '4 saat əvvəl' },
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('loadingDashboard')}</p>
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
      <div className="space-y-8 container mx-auto px-4 py-4">
        <DashboardHeader />
        {renderDashboardContent()}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
