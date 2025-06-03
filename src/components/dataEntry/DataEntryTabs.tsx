
import React from 'react';
import { School, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataEntryContent } from './DataEntryContent';
import { SectorAdminSchoolList } from './SectorAdminSchoolList';
import { useSchoolSelector } from '@/hooks/dataEntry/useSchoolSelector';
import { User } from '@/types/user';

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
  user: User | null;
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
      setTabValue('school');
    }
  };

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
      <TabsList>
        <TabsTrigger value="school">
          <School className="mr-2 h-4 w-4" />
          Məktəb Kateqoriyaları
        </TabsTrigger>
        <TabsTrigger value="sector">
          <Building className="mr-2 h-4 w-4" />
          Sektor Kateqoriyaları
        </TabsTrigger>
      </TabsList>

      <TabsContent value="school" className="space-y-6">
        <DataEntryContent
          displayCategories={displayCategories}
          selectedSchoolId={selectedSchoolId}
          selectedSchoolName={selectedSchoolName}
          overallProgress={overallProgress}
          categoryStats={categoryStats}
          isSectorAdmin={true}
          schools={schools}
          schoolSearchQuery={schoolSearchQuery}
          setSchoolSearchQuery={setSchoolSearchQuery}
          handleSchoolChange={handleSchoolChange}
        />
      </TabsContent>

      <TabsContent value="sector" className="space-y-6">
        <SectorAdminSchoolList
          schools={schools || []}
          isLoading={false}
          onDataEntry={handleSchoolDataEntry}
          onSendNotification={(schoolIds) => {
            console.log('Notification sent to schools:', schoolIds);
          }}
        />
      </TabsContent>
    </Tabs>
  );
};
