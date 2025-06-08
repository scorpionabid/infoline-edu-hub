
import React, { useState } from 'react';
import ReportHeader from '@/components/reports/ReportHeader';
import { ReportList } from '@/components/reports/ReportList';
import SchoolColumnTable from '@/components/reports/SchoolColumnTable';
import ReportDashboard from '@/components/reports/advanced/ReportDashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("advanced");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  return (
    <>
      <Helmet>
        <title>{t('reports')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-3 space-y-4">
        <div className="space-y-4">
          <ReportHeader 
            onCategorySelect={setSelectedCategoryId} 
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="advanced">
                {t("advancedReporting")}
              </TabsTrigger>
              <TabsTrigger value="schools-columns">
                {t("schoolColumnReportTitle")}
              </TabsTrigger>
              <TabsTrigger value="templates">
                {t("allReports")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="advanced" className="mt-4">
              <ReportDashboard />
            </TabsContent>
            
            <TabsContent value="schools-columns" className="mt-4">
              <SchoolColumnTable categoryId={selectedCategoryId} />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-4">
              <ReportList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Reports;
