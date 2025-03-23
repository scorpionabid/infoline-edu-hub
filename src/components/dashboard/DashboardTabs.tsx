
import React from 'react';
import { Activity, PieChart, BarChart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ActivityTab from './tabs/ActivityTab';
import RegionsTab from './tabs/RegionsTab';
import CategoriesTab from './tabs/CategoriesTab';

interface DashboardTabsProps {
  activityData: Array<{
    name: string;
    value: number;
  }>;
  regionSchoolsData: Array<{
    name: string;
    value: number;
  }>;
  categoryCompletionData: Array<{
    name: string;
    completed: number;
  }>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activityData, 
  regionSchoolsData, 
  categoryCompletionData 
}) => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="activity" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="activity">
          <Activity className="h-4 w-4 mr-2" />
          {t('systemActivity')}
        </TabsTrigger>
        <TabsTrigger value="regions">
          <PieChart className="h-4 w-4 mr-2" />
          Bölgələr üzrə statistika
        </TabsTrigger>
        <TabsTrigger value="categories">
          <BarChart className="h-4 w-4 mr-2" />
          Kateqoriyalar üzrə tamamlanma
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="activity">
        <ActivityTab activityData={activityData} />
      </TabsContent>
      
      <TabsContent value="regions">
        <RegionsTab regionSchoolsData={regionSchoolsData} />
      </TabsContent>
      
      <TabsContent value="categories">
        <CategoriesTab categoryCompletionData={categoryCompletionData} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
