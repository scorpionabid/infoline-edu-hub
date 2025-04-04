
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
import { useLanguageSafe } from '@/context/LanguageContext';

export interface DataEntryDialogsProps {
  isSubmitDialogOpen: boolean;
  setIsSubmitDialogOpen: (open: boolean) => void;
  isHelpDialogOpen: boolean;
  setIsHelpDialogOpen: (open: boolean) => void;
  submitForApproval: () => void;
}

const DataEntryDialogs: React.FC<DataEntryDialogsProps> = ({
  isSubmitDialogOpen,
  setIsSubmitDialogOpen,
  isHelpDialogOpen,
  setIsHelpDialogOpen,
  submitForApproval
}) => {
  const { t } = useLanguageSafe();
  
  const handleSubmitConfirm = () => {
    submitForApproval();
    setIsSubmitDialogOpen(false);
  };
  
  return (
    <>
      {/* Submit Confirmation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('submitForApproval')}</DialogTitle>
            <DialogDescription>
              {t('submitWarning')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleSubmitConfirm}>
              {t('submitForApprovalBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help Dialog */}
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
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
            <Button onClick={() => setIsHelpDialogOpen(false)}>
              {t('understood')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataEntryDialogs;
