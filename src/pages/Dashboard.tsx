
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isSchoolAdmin = user?.role === 'schooladmin';
  const navigate = useNavigate();
  
  useEffect(() => {
    // Əgər autentifikasiya yoxdursa və yükləmə tamamlanıbsa, login səhifəsinə yönləndiririk
    if (!isAuthenticated && !isLoading) {
      console.log("Dashboard: İstifadəçi autentifikasiya olmayıb, login səhifəsinə yönləndirilir");
      navigate('/login');
      return;
    }

    // Autentifikasiya olunub, amma user məlumatları yoxdursa, xəta göstəririk
    if (isAuthenticated && !user && !isLoading) {
      console.error("Dashboard: İstifadəçi autentifikasiya olunub, lakin user məlumatları yoxdur");
      toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
        description: 'Zəhmət olmasa, yenidən daxil olun',
      });
    }
    
    // Məlumatları loglamaq
    console.log('Dashboard səhifəsi yükləndi:', {
      isAuthenticated,
      isLoading,
      userRole: user?.role || 'unknown',
      userId: user?.id || 'unknown'
    });
  }, [isAuthenticated, isLoading, user, navigate]);
  
  // Yüklənmə halında spinner göstəririk
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // İstifadəçi autentifikasiya olmayıbsa və ya rol məlumatı yoxdursa, xəta göstəririk
  if (!isAuthenticated || !user || !user.role) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">
            <span className="icon">error</span>
          </div>
          <h1 className="text-xl font-semibold">İstifadəçi məlumatları tapılmadı</h1>
          <p className="text-gray-500 mt-2">Zəhmət olmasa yenidən daxil olun</p>
          <button 
            onClick={() => {
              localStorage.clear(); // Lokal keşi təmizləyirik
              navigate('/login');
            }} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Yenidən daxil olun
          </button>
        </div>
      </div>
    );
  }
  
  console.log(`Dashboard: İstifadəçi rolu - ${user.role}`);
  
  return (
    <div className="space-y-4 p-4">
      <DashboardHeader />
      
      {isSchoolAdmin && <SchoolAdminSetupCheck />}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
