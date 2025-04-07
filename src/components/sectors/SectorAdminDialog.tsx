
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ExistingUserSectorAdminDialog } from './ExistingUserSectorAdminDialog';
import { Sector } from '@/types/supabase';

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
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Dialog açıldığında tab seçimini sıfırla
  useEffect(() => {
    if (open) {
      setActiveTab('existing');
    }
  }, [open]);

  if (!sector) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignSectorAdmin') || 'Sektor Admini Təyin Et'}</DialogTitle>
          <DialogDescription>
            {t('assignSectorAdminDesc') || `"${sector.name}" sektoru üçün admin təyin edin`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 border-b">
          <Button
            variant={activeTab === 'existing' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent px-4 py-1.5 transition-colors"
            style={activeTab === 'existing' ? { borderBottomColor: 'hsl(var(--primary))' } : {}}
            onClick={() => setActiveTab('existing')}
          >
            {t('existingUser') || 'Mövcud istifadəçi'}
          </Button>
          <Button
            variant={activeTab === 'new' ? 'default' : 'ghost'}
            className="rounded-none border-b-2 border-transparent px-4 py-1.5 transition-colors"
            style={activeTab === 'new' ? { borderBottomColor: 'hsl(var(--primary))' } : {}}
            onClick={() => setActiveTab('new')}
          >
            {t('newUser') || 'Yeni istifadəçi'}
          </Button>
        </div>

        {activeTab === 'existing' ? (
          <ExistingUserSectorAdminDialog
            open={open}
            setOpen={setOpen}
            sector={sector}
            onSuccess={onSuccess}
            isEmbedded={true}
          />
        ) : (
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('featureNotImplemented') || 'Bu funksionallıq hələ tam hazır deyil'}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                {t('close') || 'Bağla'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
