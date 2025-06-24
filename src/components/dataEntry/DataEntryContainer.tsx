import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import SchoolAdminDataEntry from '@/components/dataEntry/SchoolAdminDataEntry';
// Deprecated: import UnifiedSectorDataEntry from '@/components/dataEntry/unified/UnifiedSectorDataEntry';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface DataEntryContainerProps {
  children?: React.ReactNode;
}

export const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ children }) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();

  // Get user role from auth store or user object
  const getUserRole = () => {
    if (!user) return null;
    
    // Check if user object has role information
    if (user.role) return user.role;
    
    // You might need to fetch role from user_roles table
    // For now, we'll use a simple check based on user properties
    if (user.school_id || user.schoolId) return 'schooladmin';
    if (user.sector_id || user.sectorId) return 'sectoradmin';
    if (user.region_id || user.regionId) return 'regionadmin';
    
    return 'superadmin';
  };

  const userRole = getUserRole();

  if (!user || !userRole) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          İstifadəçi məlumatları tapılmadı. Zəhmət olmasa yenidən giriş edin.
        </AlertDescription>
      </Alert>
    );
  }

  // Render role-specific data entry component
  const renderDataEntryComponent = () => {
    switch (userRole) {
      case 'schooladmin':
        return <SchoolAdminDataEntry />;
      
      case 'sectoradmin':
      case 'regionadmin':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {userRole === 'sectoradmin' ? 'Sektor' : 'Region'} adminləri üçün yeni vahid Data İdarəetməsi sistemi mövcuddur.
              </span>
              <Button 
                onClick={() => navigate('/data-management')} 
                className="ml-4"
              >
                Data İdarəetməsinə keç
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      case 'superadmin':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              SuperAdmin üçün məlumat daxil etmə interfeysi hazırlanır.
              Zəhmət olmasa digər admin rolllarından birini istifadə edin.
            </AlertDescription>
          </Alert>
        );
      
      default:
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tanınmayan istifadəçi rolu: {userRole}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="w-full">
      {children || renderDataEntryComponent()}
    </div>
  );
};

export default DataEntryContainer;