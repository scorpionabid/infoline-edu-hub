
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExistingUserSectorAdminDialog } from './ExistingUserSectorAdminDialog';

interface SectorAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  sector: Sector | null;
  onSuccess?: () => void;
}

export const SectorAdminDialog: React.FC<SectorAdminDialogProps> = ({ 
  open, 
  setOpen, 
  sector,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [showExistingUserDialog, setShowExistingUserDialog] = useState(false);
  
  React.useEffect(() => {
    // Dialog açıldığında xəta mesajlarını sıfırla
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleExistingUserSelect = () => {
    setShowExistingUserDialog(true);
    setOpen(false);
  };
  
  const handleExistingUserClose = () => {
    setShowExistingUserDialog(false);
    setOpen(true);
  };

  const handleExistingUserSuccess = () => {
    setShowExistingUserDialog(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  if (!sector) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('assignSectorAdmin') || 'Sektor admini təyin et'}</DialogTitle>
            <DialogDescription>
              {t("assignSectorAdminDesc") || `"${sector.name}" sektoru üçün admin təyin edin`}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('assignExistingUserAsAdmin') || 'Mövcud istifadəçini admin kimi təyin edin'}
            </p>
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="mr-2"
              >
                {t("cancel") || 'Ləğv et'}
              </Button>
              <Button 
                onClick={handleExistingUserSelect}
              >
                {t("selectUser") || 'İstifadəçi seçin'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ExistingUserSectorAdminDialog
        open={showExistingUserDialog}
        setOpen={handleExistingUserClose}
        sector={sector}
        onSuccess={handleExistingUserSuccess}
      />
    </>
  );
};
