
import React from 'react';
import { School, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectorDataEntry } from './SectorDataEntry';
import { SchoolManagement } from './SchoolManagement';
import { useSchoolSelector } from '@/hooks/dataEntry/useSchoolSelector';
import { FullUserData } from '@/types/auth';

interface DataEntryTabsProps {
  tabValue: string;
  setTabValue: (value: string) => void;
  selectedSchoolId: string | null;
  setSelectedSchoolId: (id: string | null) => void;
  selectedSchoolName: string;
  setSelectedSchoolName: (name: string) => void;
  displayCategories: any[];
  overallProgress: number;
  categoryStats: { completed: number; total: number };
  user: FullUserData | null;
}

export const DataEntryTabs: React.FC<DataEntryTabsProps> = ({
  tabValue,
  setTabValue,
  selectedSchoolId,
  setSelectedSchoolId,
  selectedSchoolName,
  setSelectedSchoolName,
  displayCategories,
  overallProgress,
  categoryStats,
  user
}) => {
  const {
    schools,
    schoolSearchQuery,
    setSchoolSearchQuery,
    handleSchoolChange
  } = useSchoolSelector({ 
    isSectorAdmin: true, 
    sectorId: user?.sector_id || null 
  });

  const handleSchoolDataEntry = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setSelectedSchoolId(schoolId);
      setSelectedSchoolName(school.name);
      setTabValue('school-management');
    }
  };

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
      <TabsList>
        <TabsTrigger value="sector-data">
          <Building className="mr-2 h-4 w-4" />
          Sektor Məlumatları
        </TabsTrigger>
        <TabsTrigger value="school-management">
          <School className="mr-2 h-4 w-4" />
          Məktəb İdarəetməsi
        </TabsTrigger>
      </TabsList>

      <TabsContent value="school-management" className="space-y-6">
        <SchoolManagement
          schools={schools.map(school => ({
            ...school,
            region_id: school.region_id || '',
            sector_id: school.sector_id || '',
            status: (school.status as 'active' | 'inactive') || 'active',
            created_at: school.created_at || new Date().toISOString(),
            updated_at: school.updated_at || new Date().toISOString()
          }))}
          isLoading={false}
          onDataEntry={handleSchoolDataEntry}
          onSendNotification={(schoolIds) => {
            console.log('Notification sent to schools:', schoolIds);
          }}
        />
      </TabsContent>

      <TabsContent value="sector-data" className="space-y-6">
        <SectorDataEntry 
          onComplete={() => {
            console.log('Sector data entry completed');
            // Reload or update logic if needed
          }}
        />
      </TabsContent>
    </Tabs>
  );
};
