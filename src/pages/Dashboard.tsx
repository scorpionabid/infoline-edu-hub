
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth';
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
  
  // İstifadəçi autentifikasiya olmayıbsa və ya rol məlumatı yoxdursa, null qaytarırıq
  // Yönləndirilmə useEffect-də həyata keçirilir
  if (!isAuthenticated || !user || !user.role) {
    return null;
  }
  
  console.log(`Dashboard: İstifadəçi rolu - ${user.role}`);
  
  return (
    <div className="space-y-4">
      <DashboardHeader />
      
      {isSchoolAdmin && <SchoolAdminSetupCheck />}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
