
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/dataEntry/components/StatusBadge';
import { AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EntryData {
  id: string;
  columnId: string;
  columnName: string;
  value: string;
  status: string;
}

interface EnhancedApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName: string;
  categoryName: string;
  data: EntryData[];
  isProcessing: boolean;
  currentStatus: string;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export default function EnhancedApprovalDialog({
  open,
  onOpenChange,
  schoolName,
  categoryName,
  data,
  isProcessing,
  currentStatus,
  onApprove,
  onReject,
}: EnhancedApprovalDialogProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setError('');
      await onApprove();
    } catch (error) {
      setError('Təsdiqləmə zamanı xəta baş verdi');
      console.error('Təsdiqləmə xətası:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Rədd səbəbini qeyd etmək məcburidir');
      return;
    }

    try {
      setIsRejecting(true);
      setError('');
      await onReject(reason);
    } catch (error) {
      setError('Rədd etmə zamanı xəta baş verdi');
      console.error('Rədd etmə xətası:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{schoolName} - {categoryName}</span>
            <StatusBadge status={currentStatus} />
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 p-3 rounded-md flex items-center mb-4 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 gap-3">
            {data.map((entry) => (
              <div key={entry.id} className="border rounded-md p-2 bg-muted/30">
                <div className="text-sm font-medium mb-1">{entry.columnName}</div>
                <div className="text-sm bg-white p-1.5 rounded border">
                  {entry.value || <span className="text-muted-foreground italic">Boş</span>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {currentStatus === 'pending' && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Rədd səbəbi (rədd etmək üçün)</div>
            <Textarea
              placeholder="Rədd səbəbini qeyd edin..."
              className="min-h-[80px] text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isProcessing || isApproving || isRejecting}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing || isApproving || isRejecting}
            className="mt-2 sm:mt-0"
          >
            <X className="h-4 w-4 mr-1" />
            {t('close')}
          </Button>

          {currentStatus === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || isApproving || isRejecting}
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                {t('reject')}
              </Button>

              <Button
                variant="default"
                onClick={handleApprove}
                disabled={isProcessing || isApproving || isRejecting}
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                {t('approve')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
