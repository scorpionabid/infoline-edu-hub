
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { School, Building2 } from 'lucide-react';
import Approval from './Approval';
import SectorApprovalPanel from './SectorApprovalPanel';

const ApprovalTabs: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="school" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="school" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            {t('schoolApprovals')}
          </TabsTrigger>
          <TabsTrigger value="sector" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('sectorApprovals')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-6">
          <Approval />
        </TabsContent>

        <TabsContent value="sector" className="mt-6">
          <SectorApprovalPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalTabs;
