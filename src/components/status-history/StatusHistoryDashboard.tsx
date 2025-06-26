import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface StatusHistoryDashboardProps {
  title?: string;
  description?: string;
  data: {
    timestamp: string;
    action: string;
    details?: string;
  }[];
}

const StatusHistoryDashboard: React.FC<StatusHistoryDashboardProps> = ({
  title = 'Status History',
  description = 'Recent activities and status changes',
  // data
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {data.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No status history available.
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((entry, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="text-sm text-gray-500">{entry.timestamp}</div>
                  <div className="font-medium">{entry.action}</div>
                  <div className="text-sm text-gray-600">{String(entry.details || '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusHistoryDashboard;
