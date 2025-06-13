
import React from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import SchoolAdminDataEntry from './SchoolAdminDataEntry'; // Default import-a düzəltirik
import { SectorAdminSchoolList } from '@/components/schools/SectorAdminSchoolList';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface DataEntryContainerProps {
  assignment?: 'all' | 'schools' | 'sectors';
}

export const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ 
  assignment = 'all' 
}) => {
  const user = useAuthStore(selectUser);
  const { userRole } = usePermissions();

  console.log('DataEntryContainer - User role:', userRole, 'Assignment:', assignment);

  // Sektor məlumatları üçün (assignment="sectors" kateqoriyalar)
  if (assignment === 'sectors') {
    if (userRole === 'sectoradmin' || userRole === 'regionadmin' || userRole === 'superadmin') {
      // Sektor məlumat daxil etmə formu - məktəb seçimi yoxdur
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <p className="font-semibold mb-2">Sektor məlumat daxiletmə formu hazırlanma prosesindədir</p>
            <p className="text-muted-foreground">
              Bu funksionallıq tezliklə əlavə olunacaq
            </p>
          </CardContent>
        </Card>
      );
    }
  }

  // Məktəb məlumatları üçün (assignment="all" kateqoriyalar)
  if (assignment === 'schools' || assignment === 'all') {
    if (userRole === 'sectoradmin') {
      // SectorAdmin məktəb seçir və proxy məlumat daxil edir
      return (
        <div className="h-full">
          <SectorAdminSchoolList
            onSchoolSelect={(schoolId) => {
              console.log('SectorAdmin selected school:', schoolId);
            }}
            onDataEntry={(schoolId) => {
              console.log('SectorAdmin starting data entry for school:', schoolId);
            }}
            onBulkSelect={(schoolIds) => {
              console.log('SectorAdmin bulk selected schools:', schoolIds);
            }}
          />
        </div>
      );
    } else if (userRole === 'schooladmin') {
      // SchoolAdmin birbaşa öz məktəbi üçün məlumat daxil edir
      if (!user?.school_id) {
        return (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-red-600">
                Məktəb məlumatları tapılmadı. Zəhmət olmasa admin ilə əlaqə saxlayın.
              </p>
            </CardContent>
          </Card>
        );
      }

      // SchoolAdmin üçün kateqoriya seçimi ilə data entry
      return <SchoolAdminDataEntry />;
    } else if (userRole === 'regionadmin') {
      // RegionAdmin can also access school data entry with school selection
      return (
        <div className="h-full">
          <SectorAdminSchoolList
            onSchoolSelect={(schoolId) => {
              console.log('RegionAdmin selected school:', schoolId);
            }}
            onDataEntry={(schoolId) => {
              console.log('RegionAdmin starting data entry for school:', schoolId);
            }}
            onBulkSelect={(schoolIds) => {
              console.log('RegionAdmin bulk selected schools:', schoolIds);
            }}
          />
        </div>
      );
    }
  }

  // SuperAdmin can access everything
  if (userRole === 'superadmin') {
    if (assignment === 'sectors') {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
            <p className="font-semibold mb-2">Sektor məlumat daxiletmə formu hazırlanma prosesindədir</p>
            <p className="text-muted-foreground">
              Bu funksionallıq tezliklə əlavə olunacaq
            </p>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <div className="h-full">
          <SectorAdminSchoolList
            onSchoolSelect={(schoolId) => {
              console.log('SuperAdmin selected school:', schoolId);
            }}
            onDataEntry={(schoolId) => {
              console.log('SuperAdmin starting data entry for school:', schoolId);
            }}
            onBulkSelect={(schoolIds) => {
              console.log('SuperAdmin bulk selected schools:', schoolIds);
            }}
          />
        </div>
      );
    }
  }

  // Default case - no access
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-4">
        <p className="text-muted-foreground">
          Bu bölmə sizin rolunuz üçün uyğun deyil
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Sizin rolunuz:</strong> {userRole}</p>
          <p><strong>Tələb olunan assignment:</strong> {assignment}</p>
        </div>
      </CardContent>
    </Card>
  );
};
