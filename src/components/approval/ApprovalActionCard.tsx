
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useApprovalProcess } from '@/hooks/approval/useApprovalProcess';

interface ApprovalActionCardProps {
  entry: any;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ApprovalActionCard: React.FC<ApprovalActionCardProps> = ({
  entry,
  onApprove,
  onReject
}) => {
  const { approveEntry, rejectEntry, isProcessing } = useApprovalProcess();

  const handleApprove = async () => {
    try {
      await approveEntry(entry.id);
      onApprove?.();
    } catch (error) {
      console.error('Error approving entry:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectEntry(entry.id, 'Rədd edildi');
      onReject?.();
    } catch (error) {
      console.error('Error rejecting entry:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-medium">{entry.title || 'Məlumat girişi'}</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(entry.status)}
            <Badge variant={entry.status === 'approved' ? 'default' : entry.status === 'rejected' ? 'destructive' : 'secondary'}>
              {entry.status === 'approved' ? 'Təsdiqlənib' : entry.status === 'rejected' ? 'Rədd edilib' : 'Gözləmədə'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{entry.value || 'Məlumat dəyəri'}</p>
          
          {entry.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Təsdiqlə
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Rədd et
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
