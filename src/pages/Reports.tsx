
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportList from '@/components/reports/ReportList';
import SchoolColumnTable from '@/components/reports/SchoolColumnTable';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("schools-columns");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <ReportHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schools-columns">
              {t("schoolColumnReportTitle")}
            </TabsTrigger>
            <TabsTrigger value="templates">
              {t("allReports")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schools-columns" className="mt-6">
            <SchoolColumnTable categoryId={selectedCategoryId} />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            <ReportList />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default Reports;
