
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import RegionAdminDashboard from '@/components/dashboard/RegionAdminDashboard';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';

// Mock data from the original Dashboard.tsx
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
  
  const renderDashboardContent = () => {
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
