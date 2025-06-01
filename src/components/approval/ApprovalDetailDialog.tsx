
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, User, School, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ApprovalDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  approval: any;
  onApprove: () => void;
  onReject: (reason: string) => void;
  isProcessing?: boolean;
}

const ApprovalDetailDialog: React.FC<ApprovalDetailDialogProps> = ({
  isOpen,
  onClose,
  approval,
  onApprove,
  onReject,
  isProcessing = false
}) => {
  const { t } = useLanguage();

  if (!approval) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {t(status)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('approvalDetails')}
          </DialogTitle>
          <DialogDescription>
            {t('reviewDataSubmission')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <School className="h-5 w-5" />
                {t('basicInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('school')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{approval.schoolName}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('category')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{approval.categoryName}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('submittedAt')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(approval.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{t('status')}</span>
                  </div>
                  {getStatusBadge(approval.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('dataEntries')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approval.entries?.map((entry: any, index: number) => (
                  <div key={entry.id || index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{entry.column?.name || `${t('field')} ${index + 1}`}</h4>
                      {entry.status && getStatusBadge(entry.status)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {t('type')}: {entry.column?.type || 'text'}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">{entry.value || t('noValue')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          {approval.history && approval.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('approvalHistory')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approval.history.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                      {getStatusIcon(item.action)}
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{t(item.action)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <User className="h-3 w-3 inline mr-1" />
                          {item.action_by_role} - {item.action_by}
                        </div>
                        {item.notes && (
                          <p className="text-sm mt-2 p-2 bg-gray-50 rounded">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        {approval.status === 'pending' && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t('close')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject('Məlumatlar tələblərə uyğun deyil')}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('reject')}
            </Button>
            <Button
              onClick={onApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('approve')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetailDialog;
