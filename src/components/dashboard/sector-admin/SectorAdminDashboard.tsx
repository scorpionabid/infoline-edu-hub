
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import SectorStatsCard from './SectorStatsCard';
import SchoolsTable from './SchoolsTable';
import { SectorAdminDashboardData, SchoolStat } from '@/types/dashboard';
import { EnhancedApprovalDialog } from '../approval/EnhancedApprovalDialog';

interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  const handleApprove = async () => {
    // API çağırışı ilə təsdiq ediləcək
    console.log('Təsdiqləndi:', selectedSubmission);
    return Promise.resolve();
  };
  
  const handleReject = async (reason: string) => {
    // API çağırışı ilə rədd ediləcək
    console.log('Rədd edildi:', selectedSubmission, 'Səbəb:', reason);
    return Promise.resolve();
  };
  
  // Nümunə məlumatları
  const mockSchools: SchoolStat[] = [
    {
      id: '1',
      name: 'Bakı şəhəri 220 nömrəli məktəb',
      region: 'Bakı şəhəri',
      formStatus: 'completed',
      lastUpdate: '2023-05-01',
      completion: 100
    },
    {
      id: '2',
      name: 'Bakı şəhəri 132 nömrəli məktəb',
      region: 'Bakı şəhəri',
      formStatus: 'in_progress',
      lastUpdate: '2023-04-28',
      completion: 65
    },
    {
      id: '3',
      name: 'Bakı şəhəri 45 nömrəli məktəb',
      region: 'Bakı şəhəri',
      formStatus: 'pending',
      lastUpdate: '2023-04-25',
      completion: 20
    },
    {
      id: '4',
      name: 'Bakı şəhəri 67 nömrəli məktəb',
      region: 'Bakı şəhəri',
      formStatus: 'overdue',
      lastUpdate: '2023-04-20',
      completion: 0
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SectorStatsCard
          title={t('totalSchools')}
          value={data.statistics.totalSchools}
          description={t('schoolsInYourSector')}
          indicator="neutral"
        />
        <SectorStatsCard
          title={t('activeSchools')}
          value={data.statistics.activeSchools}
          description={t('schoolsActiveInYourSector')}
          indicator="positive"
        />
        <SectorStatsCard
          title={t('pendingSubmissions')}
          value={data.statistics.pendingSubmissions}
          description={t('submissionsWaitingForApproval')}
          indicator="warning"
        />
        <SectorStatsCard
          title={t('completedSubmissions')}
          value={data.statistics.completedSubmissions}
          description={t('approvedSubmissions')}
          indicator="positive"
        />
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('schoolsInYourSector')}</CardTitle>
            <CardDescription>{t('overviewOfSchoolsAndSubmissions')}</CardDescription>
          </div>
          <Button variant="outline">
            {t('exportData')}
          </Button>
        </CardHeader>
        <CardContent>
          <SchoolsTable 
            schools={data.schools.length > 0 ? data.schools : mockSchools} 
            onViewDetails={(school) => {
              console.log('Məktəb detalları:', school);
            }}
            onViewSubmissions={(school) => {
              console.log('Məktəb təqdimetmələri:', school);
            }}
          />
        </CardContent>
      </Card>
      
      <EnhancedApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        submissionData={selectedSubmission}
        title={t('reviewSubmission')}
        description={t('approveOrRejectSubmissionDescription')}
      />
    </div>
  );
};
