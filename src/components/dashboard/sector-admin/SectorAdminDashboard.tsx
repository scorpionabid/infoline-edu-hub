
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Button } from '@/components/ui/button';
import { Download, FileCheck, FileQuestion, School, Users } from 'lucide-react';
import { StatsCard } from '../common/StatsCard';
import { CompletionRateCard } from '../common/CompletionRateCard';
import SchoolsTable from './SchoolsTable';
import { SchoolStats } from '@/types/dashboard';

interface SectorAdminDashboardProps {
  data: {
    statistics: {
      totalSchools: number;
      activeSchools: number;
      pendingSubmissions: number;
      completedSubmissions: number;
    };
    schools: SchoolStats[];
    completionRate?: number;
  };
}

export const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({ data }) => {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  
  // Submisyonu təsdiqləmə
  const handleApproveSubmission = async () => {
    try {
      // Təsdiqləmə logikası
      setIsApprovalDialogOpen(false);
    } catch (error) {
      console.error('Təsdiqləmə xətası:', error);
    }
  };

  // Submisyonu rədd etmə
  const handleRejectSubmission = async (reason: string) => {
    try {
      // Rədd etmə logikası
      setIsApprovalDialogOpen(false);
    } catch (error) {
      console.error('Rədd etmə xətası:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sektor Dashboard</h2>
      
      <Grid columns={4} className="gap-6">
        <StatsCard 
          title="Məktəblər" 
          value={data.statistics.totalSchools} 
          icon={<School className="h-5 w-5" />}
          description="Toplam məktəb sayı"
          trend={`${data.statistics.activeSchools} aktiv`}
          trendDirection="up"
        />
        <StatsCard 
          title="Təsdiqlənmiş" 
          value={data.statistics.completedSubmissions} 
          icon={<FileCheck className="h-5 w-5" />}
          description="Təsdiqlənmiş formlar"
          trend="Son 7 gündə"
          trendDirection="up"
        />
        <StatsCard 
          title="Gözləmədə" 
          value={data.statistics.pendingSubmissions} 
          icon={<FileQuestion className="h-5 w-5" />}
          description="Təsdiq gözləyən"
          trend="Digərləri yubanır"
          trendDirection="neutral"
        />
        <StatsCard 
          title="İstifadəçilər" 
          value={data.statistics.totalSchools} 
          icon={<Users className="h-5 w-5" />} 
          description="Məktəb adminləri"
          trend="Hamısı aktiv"
          trendDirection="up"
        />
      </Grid>
      
      <Grid columns={1} className="gap-6">
        <CompletionRateCard
          completionRate={data.completionRate || 0}
          title="Sektor Tamamlanma Faizi"
        />
      </Grid>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Məktəb Məlumatları</h3>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Hesabat Yüklə
          </Button>
        </div>
        
        <SchoolsTable 
          schools={data.schools} 
          onViewDetails={(schoolId) => {
            // Məktəb detallarını göstərmə logikası
            console.log('Məktəb detalları:', schoolId);
          }}
        />
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
