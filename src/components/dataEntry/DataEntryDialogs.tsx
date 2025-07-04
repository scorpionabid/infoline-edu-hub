
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

export interface DialogsState {
  isSubmitDialogOpen: boolean;
  isHelpDialogOpen: boolean;
  isRejectionDialogOpen: boolean;
  isApprovalDialogOpen: boolean;
}

export interface DataEntryDialogsProps {
  state: DialogsState;
  onClose: () => void;
  onConfirm: (type: string) => void;
}

export const DataEntryDialogs: React.FC<DataEntryDialogsProps> = ({
  state,
  onClose,
  onConfirm
}) => {
  const { t } = useTranslation();
  
  const handleSubmitConfirm = () => {
    onConfirm('submit');
  };
  
  const handleApprovalConfirm = () => {
    onConfirm('approve');
  };
  
  const handleRejectionConfirm = () => {
    onConfirm('reject');
  };
  
  return (
    <>
      {/* Submit Confirmation Dialog */}
      <Dialog open={state.isSubmitDialogOpen} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('submitForApproval')}</DialogTitle>
            <DialogDescription>
              {t('submitWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onClose()}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmitConfirm}>
              {t('submitForApprovalBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help Dialog */}
      <Dialog open={state.isHelpDialogOpen} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('aboutDataEntry')}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2 my-4">
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                1
              </span>
              <span>{t('helpTip1')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                2
              </span>
              <span>{t('helpTip2')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                3
              </span>
              <span>{t('helpTip3')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                4
              </span>
              <span>{t('helpTip4')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                5
              </span>
              <span>{t('helpTip5')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                6
              </span>
              <span>{t('helpTip6')}</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                7
              </span>
              <span>{t('helpTip7')}</span>
            </li>
          </ul>
          <DialogFooter>
            <Button onClick={() => onClose()}>
              {t('understood')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Dialog */}
      <Dialog open={state.isApprovalDialogOpen} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('approveData')}</DialogTitle>
            <DialogDescription>
              {t('approvalWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onClose()}>
              {t('cancel')}
            </Button>
            <Button onClick={handleApprovalConfirm} className="bg-green-600 hover:bg-green-700">
              {t('approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={state.isRejectionDialogOpen} onOpenChange={() => onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectData')}</DialogTitle>
            <DialogDescription>
              {t('rejectionWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onClose()}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRejectionConfirm}>
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataEntryDialogs;
