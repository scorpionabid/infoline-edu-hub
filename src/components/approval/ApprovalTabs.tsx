
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ApprovalDialog } from './ApprovalDialog';
import { ApprovalItem } from '@/types/approval';
import { DataEntryStatus } from '@/types/dataEntry';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock,
  School,
  FileText,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface ApprovalTabsProps {
  items: ApprovalItem[];
  type: DataEntryStatus;
  onApprove?: (itemId: string, comment?: string) => Promise<void>;
  onReject?: (itemId: string, reason: string) => Promise<void>;
  onView?: (item: ApprovalItem) => void;
}

export const ApprovalTabs: React.FC<ApprovalTabsProps> = ({
  items,
  type,
  onApprove,
  onReject,
  onView
}) => {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'approve' | 'reject' | 'view', item: ApprovalItem) => {
    setSelectedItem(item);
    setDialogAction(action);
    
    if (action === 'view' && onView) {
      onView(item);
    }
  };

  const handleApprove = async (comment?: string) => {
    if (!selectedItem || !onApprove) return;
    
    setIsProcessing(true);
    try {
      await onApprove(selectedItem.id, comment);
      setSelectedItem(null);
      setDialogAction(null);
    } catch (error) {
      console.error('Error approving item:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedItem || !onReject) return;
    
    setIsProcessing(true);
    try {
      await onReject(selectedItem.id, reason);
      setSelectedItem(null);
      setDialogAction(null);
    } catch (error) {
      console.error('Error rejecting item:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: DataEntryStatus) => {
    switch (status) {
      case DataEntryStatus.PENDING:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Gözləyən</Badge>;
      case DataEntryStatus.APPROVED:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Təsdiqlənmiş</Badge>;
      case DataEntryStatus.REJECTED:
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rədd edilmiş</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Bu statusda məlumat tapılmadı</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  {item.schoolName}
                </CardTitle>
                {getStatusBadge(item.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Kateqoriya:</span>
                      <span>{item.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Tarix:</span>
                      <span>{format(new Date(item.submittedAt), 'dd.MM.yyyy HH:mm')}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Tamamlanma:</span>
                      <span>{item.completionRate}%</span>
                    </div>
                    <Progress value={item.completionRate} className="h-2" />
                  </div>
                </div>

                {/* Entry Details */}
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Məlumat sayı:</span> {item.entries.length} sahə
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('view', item)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Bax
                  </Button>
                  
                  {type === DataEntryStatus.PENDING && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction('approve', item)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Təsdiqlə
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('reject', item)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rədd et
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Dialog */}
      {selectedItem && dialogAction && (
        <ApprovalDialog
          isOpen={true}
          onClose={() => {
            setSelectedItem(null);
            setDialogAction(null);
          }}
          item={selectedItem}
          action={dialogAction}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};

export default ApprovalTabs;
