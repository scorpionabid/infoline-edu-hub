import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  // AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface DataActionsProps {
  selectedSchools: string[];
  onBulkApprove: (schoolIds: string[]) => Promise<boolean>;
  onBulkReject: (schoolIds: string[], reason: string) => Promise<boolean>;
  disabled?: boolean;
}

/**
 * Data Actions Component
 * 
 * Provides bulk approval and rejection actions for selected schools.
 * Includes confirmation dialogs and reason input for rejections.
 * 
 * Features:
 * - Bulk approve with confirmation
 * - Bulk reject with reason input
 * - Loading states
 * - Error handling
 */
export const DataActions: React.FC<DataActionsProps> = ({
  selectedSchools,
  onBulkApprove,
  onBulkReject,
  disabled = false
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedSchools.length === 0) return;

    const confirmed = window.confirm(
      `${selectedSchools.length} məktəbin məlumatını təsdiqləmək istəyirsiniz?`
    );

    if (!confirmed) return;

    setIsApproving(true);
    try {
      const success = await onBulkApprove(selectedSchools);
      if (success) {
        toast.success(`${selectedSchools.length} məlumat təsdiqləndi`);
      }
    } catch (error) {
      toast.error('Toplu təsdiq zamanı xəta baş verdi');
    } finally {
      setIsApproving(false);
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedSchools.length === 0 || !rejectReason.trim()) {
      toast.error('Rədd səbəbi daxil edilməlidir');
      return;
    }

    setIsRejecting(true);
    try {
      const success = await onBulkReject(selectedSchools, rejectReason.trim());
      if (success) {
        toast.success(`${selectedSchools.length} məlumat rədd edildi`);
        setRejectReason('');
        setShowRejectDialog(false);
      }
    } catch (error) {
      toast.error('Toplu rədd zamanı xəta baş verdi');
    } finally {
      setIsRejecting(false);
    }
  };

  if (selectedSchools.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Bulk Approve Button */}
      <Button
        size="sm"
        variant="default"
        onClick={handleBulkApprove}
        disabled={disabled || isApproving || isRejecting}
        className="flex items-center gap-2"
      >
        {isApproving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        Hamısını Təsdiqlə ({selectedSchools.length})
      </Button>

      {/* Bulk Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="destructive"
            disabled={disabled || isApproving || isRejecting}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Hamısını Rədd Et ({selectedSchools.length})
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Toplu Rədd Etmə
            </DialogTitle>
            <DialogDescription>
              {selectedSchools.length} məktəbin məlumatını rədd etmək istəyirsiniz. 
              Rədd etmə səbəbini qeyd edin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Rədd Səbəbi *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Məlumatların rədd edilmə səbəbini qeyd edin..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              disabled={isRejecting}
            >
              Ləğv et
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkReject}
              disabled={isRejecting || !rejectReason.trim()}
              className="flex items-center gap-2"
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Rədd Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};