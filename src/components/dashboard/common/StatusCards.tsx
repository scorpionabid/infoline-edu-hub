
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PendingApprovalItem } from '@/types/dashboard'; 

interface StatusCardsProps {
  approvalCount: number;
  rejectionCount: number;
  pendingCount: number;
  totalCount: number;
  pendingItems?: PendingApprovalItem[];
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  approvalCount,
  rejectionCount,
  pendingCount,
  totalCount,
  pendingItems
}) => {
  const approvalRate = totalCount ? Math.round((approvalCount / totalCount) * 100) : 0;
  const rejectionRate = totalCount ? Math.round((rejectionCount / totalCount) * 100) : 0;
  const pendingRate = totalCount ? Math.round((pendingCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Təsdiqlənmiş</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {approvalCount}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({approvalRate}%)
            </span>
          </div>
          <Progress value={approvalRate} className="h-2" indicatorClassName="bg-green-500" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Rədd edilmiş</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {rejectionCount}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({rejectionRate}%)
            </span>
          </div>
          <Progress value={rejectionRate} className="h-2" indicatorClassName="bg-red-500" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gözləmədə</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">
            {pendingCount}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({pendingRate}%)
            </span>
          </div>
          <Progress value={pendingRate} className="h-2" indicatorClassName="bg-yellow-500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;

