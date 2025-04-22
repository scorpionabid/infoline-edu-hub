
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
import { AlertCircle, CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from '../dataEntry/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState('review');

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              {t('reviewData')}
            </TabsTrigger>
            {isRejecting && (
              <TabsTrigger value="reject" className="flex items-center">
                <XCircle className="mr-2 h-4 w-4" />
                {t('rejectionReason')}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="review" className="mt-4">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {data.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 py-2 border-b last:border-0">
                    <div className="font-medium text-muted-foreground">
                      {item.columnName}
                    </div>
                    <div className="break-words">{item.value || '-'}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="reject" className="mt-4">
            <div className="space-y-2">
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
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2">
          {isRejecting ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejecting(false);
                  setActiveTab('review');
                }}
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
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('rejecting')}
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {t('confirmReject')}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejecting(true);
                  setActiveTab('reject');
                }}
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
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('approving')}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t('approve')}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
