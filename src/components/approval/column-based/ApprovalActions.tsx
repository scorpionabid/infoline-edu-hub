import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  MessageSquare,
  Users,
  X
} from 'lucide-react';
import { BulkApprovalResult } from '@/types/columnBasedApproval';
import { toast } from 'sonner';

interface ApprovalActionsProps {
  selectedCount: number;
  isProcessing: boolean;
  onBulkApprove: (comment?: string) => Promise<BulkApprovalResult>;
  onBulkReject: (reason: string, comment?: string) => Promise<BulkApprovalResult>;
  onCancel: () => void;
  className?: string;
}

type ActionType = 'approve' | 'reject' | null;

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  selectedCount,
  isProcessing,
  onBulkApprove,
  onBulkReject,
  onCancel,
  className
}) => {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle approve action
  const handleApprove = () => {
    setActiveAction('approve');
    setComment('');
  };

  // Handle reject action
  const handleReject = () => {
    setActiveAction('reject');
    setRejectionReason('');
    setComment('');
  };

  // Execute bulk approve
  const executeBulkApprove = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await onBulkApprove(comment || undefined);
      
      if (result.successCount > 0) {
        toast.success(`${result.successCount} məlumat uğurla təsdiqləndi`);
      }
      
      if (result.errorCount > 0) {
        toast.error(`${result.errorCount} məlumat təsdiqlənə bilmədi`);
      }
      
      // Reset form
      setActiveAction(null);
      setComment('');
      
    } catch (error: any) {
      console.error('Bulk approve error:', error);
      toast.error('Təsdiq zamanı xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute bulk reject
  const executeBulkReject = async () => {
    if (isSubmitting || !rejectionReason.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await onBulkReject(rejectionReason, comment || undefined);
      
      if (result.successCount > 0) {
        toast.success(`${result.successCount} məlumat uğurla rədd edildi`);
      }
      
      if (result.errorCount > 0) {
        toast.error(`${result.errorCount} məlumat rədd edilə bilmədi`);
      }
      
      // Reset form
      setActiveAction(null);
      setRejectionReason('');
      setComment('');
      
    } catch (error: any) {
      console.error('Bulk reject error:', error);
      toast.error('Rədd zamanı xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel current action
  const handleCancel = () => {
    setActiveAction(null);
    setComment('');
    setRejectionReason('');
  };

  // Close panel entirely
  const handleClose = () => {
    handleCancel();
    onCancel();
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Toplu Əməliyyatlar
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white">
            {selectedCount} məktəb seçildi
          </Badge>
          <span className="text-sm text-muted-foreground">
            Bütün seçilmiş məktəblərə eyni əməliyyat tətbiq ediləcək
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action Selection */}
        {!activeAction && (
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleApprove}
              disabled={isProcessing || selectedCount === 0}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Hamısını Təsdiq Et
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isProcessing || selectedCount === 0}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Hamısını Rədd Et
            </Button>
          </div>
        )}

        {/* Approve Form */}
        {activeAction === 'approve' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedCount} məktəbin məlumatı təsdiqlənəcək.</strong>
                <br />
                Bu əməliyyat geri alına bilməz və məktəb adminlərinə bildiriş göndəriləcək.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="text-sm font-medium">Şərh (ixtiyari)</label>
              <Textarea
                placeholder="Təsdiq barədə əlavə şərh..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1"
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Bu şərh məktəb adminlərinə göndəriləcək bildirişdə görünsün.
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={executeBulkApprove}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Təsdiq edilir...' : `${selectedCount} məlumatı təsdiq et`}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Ləğv et
              </Button>
            </div>
          </div>
        )}

        {/* Reject Form */}
        {activeAction === 'reject' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedCount} məktəbin məlumatı rədd ediləcək.</strong>
                <br />
                Bu əməliyyat geri alına bilməz və məktəb adminlərinə rədd səbəbi göndəriləcək.
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="text-sm font-medium">Rədd səbəbi *</label>
              <Input
                placeholder="Məlumatların rədd edilmə səbəbini daxil edin..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
                required
              />
              <div className="text-xs text-red-600 mt-1">
                Bu sahə məcburidir və məktəb adminlərinə göndəriləcək.
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Əlavə şərh (ixtiyari)</label>
              <Textarea
                placeholder="Rədd barədə əlavə təfsilatlar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1"
                rows={3}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Məktəb adminlərinə problemi necə həll edəcəklərini izah edin.
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive"
                onClick={executeBulkReject}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Rədd edilir...' : `${selectedCount} məlumatı rədd et`}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Ləğv et
              </Button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && !isSubmitting && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Başqa bir əməliyyat davam edir. Zəhmət olmasa gözləyin...
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        {!activeAction && (
          <div className="text-xs text-muted-foreground p-3 bg-white rounded border">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">Toplu əməliyyatlar haqqında:</div>
                <ul className="space-y-1">
                  <li>• Təsdiq edilən məlumatlar dərhal aktiv olur</li>
                  <li>• Rədd edilən məlumatlar məktəb admininə geri göndərilir</li>
                  <li>• Bütün əməliyyatlar audit qeydlərində saxlanılır</li>
                  <li>• E-mail bildirişləri avtomatik göndərilir</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalActions;
