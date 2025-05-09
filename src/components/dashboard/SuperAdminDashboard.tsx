
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RegionCompletionCard from './superadmin/RegionCompletionCard';
import SectorCompletionCard from './superadmin/SectorCompletionCard';
import { SuperAdminDashboardProps } from '@/types/dashboard';

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ data }) => {
  const { completion, regionStats = [], sectorStats = [], schoolStats = [] } = data;
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRegions || regionStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total regions in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSectors || sectorStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total sectors in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSchools || schoolStats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total schools in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completion.percentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Region and Sector Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegionCompletionCard regions={regionStats} />
        <SectorCompletionCard sectors={sectorStats} />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
