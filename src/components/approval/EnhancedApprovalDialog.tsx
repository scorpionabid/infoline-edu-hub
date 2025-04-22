
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle, CheckCircle2, FileText, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from '../dataEntry/components/StatusBadge';

interface EnhancedApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName: string;
  categoryName: string;
  data: {
    columnName: string;
    value: string;
  }[];
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isProcessing: boolean;
  currentStatus?: string;
}

const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  open,
  onOpenChange,
  schoolName,
  categoryName,
  data,
  onApprove,
  onReject,
  isProcessing,
  currentStatus
}) => {
  const { t } = useLanguage();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    await onApprove();
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    await onReject(rejectionReason);
    setRejectionReason('');
    setIsRejecting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {schoolName} - {categoryName}
            </DialogTitle>
            {currentStatus && (
              <StatusBadge status={currentStatus as any} size="lg" />
            )}
          </div>
          <DialogDescription>
            {t('reviewCategoryDataDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b last:border-0">
                  <div className="font-medium text-muted-foreground">
                    {item.columnName}
                  </div>
                  <div>{item.value || '-'}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {isRejecting && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('rejectionReason')} <span className="text-destructive">*</span>
            </label>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('rejectionWarning')}
              </AlertDescription>
            </Alert>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('enterRejectionReason')}
              className="min-h-[100px]"
            />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          {isRejecting ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRejecting(false)}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {isProcessing ? t('rejecting') : t('confirmReject')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsRejecting(true)}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('reject')}
              </Button>
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isProcessing ? t('approving') : t('approve')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
