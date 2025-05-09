
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth';
import useSchoolAdminDashboard from '@/hooks/useSchoolAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import { Info } from 'lucide-react';
import { ChartData } from '@/types/dashboard';
import DoughnutChart from '@/components/charts/DoughnutChart';
import { useLanguage } from '@/context/LanguageContext';

// Mock data for dashboards
const mockSchoolData = {
  completion: {
    percentage: 65,
    total: 20,
    completed: 13
  },
  status: {
    pending: 5,
    approved: 13,
    rejected: 2,
    draft: 0,
    total: 20,
    active: 18,
    inactive: 2
  },
  categories: [
    {
      id: '1',
      name: 'Təhsil prosesi',
      description: 'Təhsil prosesinin təşkili',
      status: 'active',
      completionRate: 75,
      deadline: "2025-06-30"
    },
    {
      id: '2',
      name: 'İnfrastruktur',
      description: 'Məktəb infrastrukturunun qiymətləndirilməsi',
      status: 'active',
      completionRate: 50,
      deadline: "2025-06-15"
    }
  ],
  upcoming: [
    {
      id: '1',
      name: 'İnfrastruktur',
      status: 'active',
      dueDate: '2025-06-15',
      progress: 50
    },
    {
      id: '2',
      name: 'Təhsil prosesi',
      status: 'active',
      dueDate: '2025-06-30',
      progress: 75
    }
  ],
  formStats: {
    pending: 5,
    approved: 13,
    rejected: 2,
    draft: 0,
    dueSoon: 2,
    overdue: 0,
    total: 20
  },
  pendingForms: [
    {
      id: '1',
      name: 'Tədris planı',
      status: 'pending',
      date: '2025-05-20',
      categoryName: 'Təhsil prosesi'
    },
    {
      id: '2',
      name: 'Müəllim heyəti',
      status: 'pending',
      date: '2025-05-18',
      categoryName: 'Kadr resursları'
    }
  ],
  completionRate: 65,
  notifications: []
};

const mockSectorData = {
  completion: {
    percentage: 72,
    total: 156,
    completed: 112
  },
  status: {
    pending: 24,
    approved: 112,
    rejected: 20,
    draft: 0,
    total: 156,
    active: 140,
    inactive: 16
  },
  schoolStats: [
    {
      id: '1',
      name: '145 nömrəli məktəb',
      status: 'active',
      completionRate: 85,
      lastUpdate: '2025-05-05T10:30:00Z',
      pendingForms: 2
    },
    {
      id: '2',
      name: '187 nömrəli məktəb',
      status: 'active',
      completionRate: 60,
      lastUpdate: '2025-05-06T14:15:00Z',
      pendingForms: 5
    }
  ],
  pendingApprovals: [
    {
      id: '1',
      schoolName: '145 nömrəli məktəb',
      categoryName: 'Təhsil prosesi',
      submittedAt: '2025-05-04T09:45:00Z',
      status: 'pending'
    },
    {
      id: '2',
      schoolName: '187 nömrəli məktəb',
      categoryName: 'İnfrastruktur',
      submittedAt: '2025-05-05T11:20:00Z',
      status: 'pending'
    }
  ],
  formStats: {
    pending: 24,
    approved: 112,
    rejected: 20,
    dueSoon: 15,
    overdue: 5,
    total: 156
  },
};

const mockRegionData = {
  completion: {
    percentage: 68,
    total: 450,
    completed: 306
  },
  status: {
    pending: 74,
    approved: 306,
    rejected: 70,
    draft: 0,
    total: 450,
    active: 420,
    inactive: 30
  },
  sectorStats: [
    {
      id: '1',
      name: 'Nəsimi rayonu',
      schoolCount: 25,
      completionRate: 72,
      pendingApprovals: 10
    },
    {
      id: '2',
      name: 'Yasamal rayonu',
      schoolCount: 18,
      completionRate: 65,
      pendingApprovals: 8
    }
  ],
  pendingApprovals: [
    {
      id: '1',
      schoolName: '145 nömrəli məktəb',
      categoryName: 'Təhsil prosesi',
      submittedAt: '2025-05-04T09:45:00Z',
      status: 'pending'
    },
    {
      id: '2',
      schoolName: '187 nömrəli məktəb',
      categoryName: 'İnfrastruktur',
      submittedAt: '2025-05-05T11:20:00Z',
      status: 'pending'
    }
  ]
};

const mockSuperAdminData = {
  regions: 12,
  sectors: 65,
  schools: 548,
  users: 1245,
  completionRate: 74
};

const DashboardContent = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: schoolAdminData, isLoading, error, refreshDashboard, handleFormClick, navigateToDataEntry } = useSchoolAdminDashboard();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error.message || t('errorLoadingDashboard')}
          </AlertDescription>
        </Alert>
      );
    }

    switch (role) {
      case 'schooladmin':
        return (
          <SchoolAdminDashboard 
            data={schoolAdminData || mockSchoolData}
            isLoading={isLoading}
            error={error}
            onRefresh={refreshDashboard}
            handleFormClick={handleFormClick}
            navigateToDataEntry={navigateToDataEntry}
            schoolId={user?.school_id || ''}
          />
        );
      case 'sectoradmin':
        return <SectorAdminDashboard data={mockSectorData} />;
      case 'regionadmin':
        return <RegionAdminDashboard data={mockRegionData} />;
      case 'superadmin':
        return <SuperAdminDashboard data={mockSuperAdminData} />;
      default:
        return (
          <Alert variant="default" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('noRoleAssigned')}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
