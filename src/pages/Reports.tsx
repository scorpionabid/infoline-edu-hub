import React, { useState } from 'react';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportList from '@/components/reports/ReportList';
import SchoolColumnTable from '@/components/reports/SchoolColumnTable';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("schools-columns");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  
  return (
    <>
      <Helmet>
        <title>{t('reports')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-6">
          <ReportHeader 
            onCategorySelect={setSelectedCategoryId} 
          />
          
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
      </div>
    </>
  );
};

export default Reports;
