import React from 'react';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import CompletionChart from './CompletionChart';
import SectorStatsTable from './SectorStatsTable';
import PendingApprovalPanel from './PendingApprovalPanel';
import SectorsList from './SectorsList';

interface RegionAdminDashboardProps {
  data: any;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Grid columns={4} className="gap-4">
        {/* Stats will be implemented here */}
      </Grid>
      
      {/* Main Content */}
      <Grid columns={3} className="gap-6">
        <Card className="col-span-2">
          <CompletionChart data={data} />
        </Card>
        
        <Card>
          <SectorStatsTable stats={data.sectorStats || []} />
        </Card>
      </Grid>
      
      {/* Sectors and Approvals */}
      <Grid columns={2} className="gap-6">
        <Card>
          <SectorsList sectors={data.sectorStats || []} />
        </Card>
        
        <Card>
          <PendingApprovalPanel approvals={data.pendingApprovals || []} />
        </Card>
      </Grid>
    </div>
  );
};

export default RegionAdminDashboard;
