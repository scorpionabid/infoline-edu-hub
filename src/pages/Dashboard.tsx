
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
  
  useEffect(() => {
    // İstifadəçi autentifikasiya olmadıqda yönləndirmə
    if (!isLoading && !isAuthenticated) {
      console.log("Dashboard: İstifadəçi autentifikasiya olmayıb, login səhifəsinə yönləndirilir");
      navigate('/login');
      return;
    }

    // İlk dəfə yüklənmə zamanı bir dəfə yoxlama
    if (initialCheck && !isLoading) {
      setInitialCheck(false);
      
      // Autentifikasiya olunub, amma user məlumatları yoxdursa, xəta göstəririk
      if (isAuthenticated && !user) {
        console.error("Dashboard: İstifadəçi autentifikasiya olunub, lakin user məlumatları yoxdur");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, initialCheck]);
  
  // Yüklənmə halında spinner göstəririk
  if (isLoading || initialCheck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // İstifadəçi autentifikasiya olmayıbsa, null qaytarırıq
  // Redirect işi useEffect-də edilir
  if (!isAuthenticated || !user) {
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
