
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface EnhancedApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  title?: string;
  description?: string;
  submissionData?: { [key: string]: any };
  isLoading?: boolean;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title = 'Təsdiq',
  description = 'Bu məlumat daxil etməni təsdiq və ya rədd edə bilərsiniz',
  submissionData,
  isLoading = false,
}) => {
  const { t } = useLanguage();
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mode, setMode] = React.useState<'review' | 'approve' | 'reject'>('review');
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
      onClose();
    } catch (error) {
      console.error('Təsdiq xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onReject(rejectionReason);
      onClose();
    } catch (error) {
      console.error('Rədd xətası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {mode === 'review' && (
          <>
            {submissionData && (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {Object.entries(submissionData).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
            
            <DialogFooter className="space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setMode('reject')}
                disabled={isLoading || isSubmitting}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t('reject')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setMode('approve')}
                disabled={isLoading || isSubmitting}
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('approve')}
              </Button>
              
              <DialogClose asChild>
                <Button variant="ghost" disabled={isLoading || isSubmitting}>
                  {t('cancel')}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
        
        {mode === 'approve' && (
          <>
            <div className="py-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">{t('approveConfirmTitle')}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('approveConfirmDescription')}
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setMode('review')}
                disabled={isLoading || isSubmitting}
              >
                {t('back')}
              </Button>
              
              <Button 
                onClick={handleApprove} 
                disabled={isLoading || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? t('processing') : t('confirmApprove')}
              </Button>
            </DialogFooter>
          </>
        )}
        
        {mode === 'reject' && (
          <>
            <div className="py-2 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium">{t('rejectConfirmTitle')}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t('rejectConfirmDescription')}
              </p>
            </div>
            
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">
                {t('rejectionReason')} <span className="text-red-500">*</span>
              </label>
              <Textarea 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('enterRejectionReason')}
                rows={3}
                disabled={isLoading || isSubmitting}
              />
              {rejectionReason.trim() === '' && mode === 'reject' && (
                <p className="text-sm text-red-500 mt-1">
                  {t('rejectionReasonRequired')}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setMode('review')}
                disabled={isLoading || isSubmitting}
              >
                {t('back')}
              </Button>
              
              <Button 
                onClick={handleReject}
                disabled={rejectionReason.trim() === '' || isLoading || isSubmitting}
                variant="destructive"
              >
                {isSubmitting ? t('processing') : t('confirmReject')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
