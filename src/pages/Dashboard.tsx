
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Yalnız bir dəfə yüklənmə zamanı yoxlama
  useEffect(() => {
    if (!loading) {
      setInitialCheck(false);
      
      // İstifadəçi autentifikasiya olmadıqda yönləndirmə
      if (!isAuthenticated) {
        console.log("Dashboard: İstifadəçi autentifikasiya olmayıb, login səhifəsinə yönləndirilir");
        navigate('/login', { state: { from: location } });
        return;
      }
      
      // Autentifikasiya olunub, amma user məlumatları yoxdursa, xəta göstəririk
      if (isAuthenticated && !user) {
        console.error("Dashboard: İstifadəçi autentifikasiya olunub, lakin user məlumatları yoxdur");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
      }
    }
  }, [isAuthenticated, loading, user, navigate, location]);
  
  // Yüklənmə halında spinner göstəririk
  if (loading || initialCheck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
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
    <div className="space-y-3">
      <DashboardHeader />
      
      {isSchoolAdmin && <SchoolAdminSetupCheck />}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
