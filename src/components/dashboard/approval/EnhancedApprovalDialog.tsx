
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export interface EnhancedApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  title: string;
  description: string;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  description
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'approve' | 'reject'>('approve');

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove();
      onClose();
    } catch (error) {
      console.error('Təsdiqlənmə xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return; // Səbəb olmadan rədd edilə bilməz
    }
    
    try {
      setIsSubmitting(true);
      await onReject(rejectionReason);
      onClose();
    } catch (error) {
      console.error('Rədd etmə xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'approve' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('approve')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Təsdiqlə
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === 'reject' ? 'border-b-2 border-destructive font-medium text-destructive' : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('reject')}
          >
            <X className="w-4 h-4 mr-2" />
            Rədd et
          </button>
        </div>
        
        {activeTab === 'approve' ? (
          <div className="py-4 flex items-center justify-center text-center">
            <div>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <p className="mb-4">Bu məlumatları təsdiqləyirsiniz?</p>
              <p className="text-sm text-muted-foreground">
                Təsdiqləndikdən sonra bu məlumatlar sistemdə qeydə alınacaq və statistikalarda göstəriləcək.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-2 mb-4 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Rədd etmə səbəbini qeyd edin</span>
            </div>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Rədd etmə səbəbini qeyd edin..."
              className="min-h-[100px]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Bu məlumat məktəb admininə göndəriləcək.
            </p>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            İmtina et
          </Button>
          {activeTab === 'approve' ? (
            <Button 
              variant="default"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Təsdiqlənir..." : "Təsdiqlə"}
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? "Rədd edilir..." : "Rədd et"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
