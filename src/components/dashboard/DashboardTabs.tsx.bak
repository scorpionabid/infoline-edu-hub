
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
  activityData = [], 
  regionSchoolsData = [], 
  categoryCompletionData = [] 
}) => {
  const { t } = useLanguage();
  
  // Dataların təmizliyi üçün əlavə yoxlama
  const safeActivityData = Array.isArray(activityData) ? activityData : [];
  const safeRegionSchoolsData = Array.isArray(regionSchoolsData) ? regionSchoolsData : [];
  const safeCategoryCompletionData = Array.isArray(categoryCompletionData) ? categoryCompletionData : [];
  
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
        <ActivityTab activityData={safeActivityData} />
      </TabsContent>
      
      <TabsContent value="regions">
        <RegionsTab regionSchoolsData={safeRegionSchoolsData} />
      </TabsContent>
      
      <TabsContent value="categories">
        <CategoriesTab categoryCompletionData={safeCategoryCompletionData} />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
