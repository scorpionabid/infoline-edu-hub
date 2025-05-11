
import React from 'react';
import { Grid } from '@/components/ui/grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, CalendarCheck } from 'lucide-react';
import { StatusCardsProps } from '@/types/dashboard';

const StatusCards: React.FC<StatusCardsProps> = (props) => {
  // Default values for when props are missing
  const status = props.status || {
    approved: 0,
    rejected: 0,
    pending: 0,
    total: 0,
    draft: 0
  };

  const formStats = props.formStats || {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    dueSoon: 0,
    overdue: 0,
    draft: 0
  };
  
  // Use formStats if available, otherwise use status
  const approvalCount = formStats?.approved || status.approved || 0;
  const rejectionCount = formStats?.rejected || status.rejected || 0;
  const pendingCount = formStats?.pending || status.pending || 0;
  const totalCount = formStats?.total || status.total || 0;
  
  // Calculations
  const approvalPercentage = totalCount ? Math.round((approvalCount / totalCount) * 100) : 0;
  const rejectionPercentage = totalCount ? Math.round((rejectionCount / totalCount) * 100) : 0;
  const pendingPercentage = totalCount ? Math.round((pendingCount / totalCount) * 100) : 0;
  
  return (
    <Grid columns={4} className="gap-4">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Təsdiqlənmiş
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvalCount}</div>
          <p className="text-xs text-muted-foreground">
            Toplam {approvalPercentage}%
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            Gözləmədə
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground">
            Toplam {pendingPercentage}%
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Rədd edilmiş
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejectionCount}</div>
          <p className="text-xs text-muted-foreground">
            Toplam {rejectionPercentage}%
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CalendarCheck className="mr-2 h-4 w-4 text-blue-500" />
            Ümumi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            Toplam form sayı
          </p>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default StatusCards;
