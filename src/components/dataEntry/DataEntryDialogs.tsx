
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryDialogsProps {
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
  const { t } = useLanguage();

  return (
    <>
      {/* Təsdiq sorğusu dialoqu */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('submitForApproval')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('submitWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={submitForApproval}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Yardım dialoqu */}
      <AlertDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('aboutDataEntry')}</AlertDialogTitle>
            <AlertDialogDescription>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>{t('helpTip1')}</li>
                <li>{t('helpTip2')}</li>
                <li>{t('helpTip3')}</li>
                <li>{t('helpTip4')}</li>
                <li>{t('helpTip5')}</li>
                <li>{t('helpTip6')}</li>
                <li>{t('helpTip7')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('understood')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataEntryDialogs;
