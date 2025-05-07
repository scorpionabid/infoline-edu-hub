
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  onComplete: () => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  categoryId,
  categoryName,
  onComplete
}) => {
  const { t } = useLanguageSafe();
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Məlumatları yüklə
  useEffect(() => {
    if (open && schoolId && categoryId) {
      loadEntries();
    }
  }, [open, schoolId, categoryId]);

  const loadEntries = async () => {
    if (!schoolId || !categoryId) return;
    
    setIsLoading(true);
    try {
      // Gözləmədə olan məlumatları əldə et
      const { data, error } = await supabase
        .from('data_entries')
        .select(`
          id,
          value,
          status,
          created_at,
          category_id,
          column_id,
          columns (name, type)
        `)
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
      
      setEntries(data || []);
    } catch (err) {
      console.error('Məlumatları yükləmə xətası:', err);
      toast.error(t('errorLoadingData'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!entries.length) return;
    
    setIsApproving(true);
    try {
      // Bütün gözləmədə olan məlumatları təsdiqlə
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
      
      toast.success(t('approvalSuccess'));
      onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error('Təsdiqləmə xətası:', err);
      toast.error(t('approvalError'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(t('rejectReasonRequired'));
      return;
    }
    
    setIsRejecting(true);
    try {
      // Bütün gözləmədə olan məlumatları rədd et
      const { error } = await supabase
        .from('data_entries')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectReason 
        })
        .eq('school_id', schoolId)
        .eq('category_id', categoryId)
        .eq('status', 'pending');

      if (error) {
        throw error;
      }
      
      toast.success(t('rejectionSuccess'));
      onComplete();
      onOpenChange(false);
    } catch (err) {
      console.error('Rədd etmə xətası:', err);
      toast.error(t('rejectionError'));
    } finally {
      setIsRejecting(false);
      setShowRejectForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('reviewSubmission')}: {schoolName} - {categoryName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            {t('noEntriesFound')}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Məlumatların göstərilməsi */}
            {entries.map((entry) => (
              <Card key={entry.id} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('field')}</Label>
                    <div className="font-medium">{entry.columns?.name || t('unknownField')}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('value')}</Label>
                    <div className="font-medium">{entry.value}</div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Rədd etmə formu */}
            {showRejectForm && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="reject-reason">{t('rejectReasonLabel')}</Label>
                <Textarea
                  id="reject-reason"
                  placeholder={t('rejectReasonPlaceholder')}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setShowRejectForm(false)} disabled={isRejecting}>
                    {t('cancel')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject} 
                    disabled={isRejecting || !rejectReason.trim()}
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('rejecting')}
                      </>
                    ) : t('confirmReject')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showRejectForm && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isApproving}
              >
                {t('close')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={isLoading || entries.length === 0}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('reject')}
              </Button>
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={isLoading || entries.length === 0 || isApproving}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('approving')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
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

export default ApprovalDialog;
