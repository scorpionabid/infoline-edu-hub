
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2, FileText, School, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ApprovalItem } from '@/types/approval';
import { DataEntryStatus } from '@/types/dataEntry';

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ApprovalItem;
  action: 'approve' | 'reject' | 'view';
  onApprove?: (comment?: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  isProcessing?: boolean;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen,
  onClose,
  item,
  action,
  onApprove,
  onReject,
  isProcessing = false
}) => {
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');

  const handleApprove = async () => {
    if (onApprove) {
      await onApprove(comment);
    }
  };

  const handleReject = async () => {
    if (onReject && reason.trim()) {
      await onReject(reason);
    }
  };

  const getDialogTitle = () => {
    switch (action) {
      case 'approve':
        return 'Məlumatları Təsdiqlə';
      case 'reject':
        return 'Məlumatları Rədd Et';
      case 'view':
        return 'Məlumat Təfərrüatları';
      default:
        return 'Məlumat';
    }
  };

  const getDialogDescription = () => {
    switch (action) {
      case 'approve':
        return 'Bu məlumatları təsdiqləmək istədiyinizə əminsiniz?';
      case 'reject':
        return 'Bu məlumatları rədd etmək istədiyinizə əminsiniz? Səbəbi qeyd edin.';
      case 'view':
        return 'Məlumat təfərrüatlarını nəzərdən keçirin.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {action === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
            {action === 'view' && <FileText className="h-5 w-5" />}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4" />
              <span className="font-medium">Məktəb:</span>
              <span>{item.schoolName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Kateqoriya:</span>
              <span>{item.categoryName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Tarix:</span>
              <span>{format(new Date(item.submittedAt), 'dd.MM.yyyy HH:mm')}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge variant="outline">{item.status}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Tamamlanma:</span>
              <span>{item.completionRate}%</span>
            </div>
          </div>

          <Separator />

          {/* Entries Summary */}
          <div className="space-y-2">
            <h4 className="font-medium">Məlumat Xülasəsi</h4>
            <div className="text-sm text-muted-foreground">
              <p>Ümumi sahə sayı: {item.entries.length}</p>
              <p>Doldurulmuş sahələr: {item.entries.filter(e => e.value && e.value.trim() !== '').length}</p>
              <p>Boş sahələr: {item.entries.filter(e => !e.value || e.value.trim() === '').length}</p>
            </div>
          </div>

          {/* Action-specific content */}
          {action === 'approve' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Qeyd (məcburi deyil)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Təsdiq üçün əlavə qeyd..."
                rows={3}
              />
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Rədd səbəbi *</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Məlumatları rədd etməyin səbəbini qeyd edin..."
                rows={3}
                required
              />
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {action === 'view' ? 'Bağla' : 'Ləğv et'}
          </Button>
          
          {action === 'approve' && (
            <Button 
              onClick={handleApprove} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Təsdiqlənir...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Təsdiqlə
                </>
              )}
            </Button>
          )}
          
          {action === 'reject' && (
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isProcessing || !reason.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rədd edilir...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rədd et
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
