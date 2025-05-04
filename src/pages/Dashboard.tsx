
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  
  // İlk yüklənmə zamanı yalnız bir dəfə yoxlama aparırıq
  useEffect(() => {
    if (!isLoading) {
      // İstifadəçi autentifikasiya olmayıbsa və yükləmə tamamlanıbsa, login səhifəsinə yönləndiririk
      if (!isAuthenticated) {
        console.log("Dashboard: İstifadəçi autentifikasiya olmayıb, login səhifəsinə yönləndirilir");
        navigate('/login');
        return;
      }

      // Autentifikasiya olunub, amma user məlumatları yoxdursa, xəta göstəririk
      if (isAuthenticated && !user) {
        console.error("Dashboard: İstifadəçi autentifikasiya olunub, lakin user məlumatları yoxdur");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
      }
      
      setInitialCheck(false);
    }
  }, [isAuthenticated, isLoading, user, navigate]);
  
  // Yüklənmə halında spinner göstəririk
  if (isLoading || initialCheck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // İstifadəçi autentifikasiya olmayıbsa və ya rol məlumatı yoxdursa, boş qaytarırıq
  // Redirect işi useEffect-də edilir
  if (!isAuthenticated || !user || !user.role) {
    return null;
  }
  
  // İstifadəçi roluna əsasən müvafiq dashboard komponentini göstəririk
  const isSchoolAdmin = user.role === 'schooladmin';
  
  return (
    <div className="space-y-4">
      <DashboardHeader />
      
      {isSchoolAdmin && <SchoolAdminSetupCheck />}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
