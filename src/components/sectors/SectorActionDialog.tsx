
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteSector } from '@/services/sectorService';
import { Sector } from '@/types/sector';

interface SectorActionDialogProps {
  sector: Sector;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SectorActionDialog: React.FC<SectorActionDialogProps> = ({ 
  sector, 
  open, 
  onOpenChange 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { t } = useLanguage();

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      if (sector) {
        const result = await deleteSector(sector.id);
        
        if (result.success) {
          // Düzgün toast sintaksisini istifadə edək
          toast.success(t('sectorDeleted'), {
            description: `${sector.name} ${t('sectorDeletedDesc')}`
          });
          onOpenChange(false);
        } else {
          // Düzgün toast sintaksisini istifadə edək
          toast.error(t('unknownErrorOccurred'), {
            description: result.error || t('couldNotDeleteSector')
          });
        }
      }
    } catch (error) {
      console.error('Sector action error:', error);
      // Düzgün toast sintaksisini istifadə edək - burada error.message-i düzgün istifadə edək
      toast.error(t('unknownErrorOccurred'), {
        description: error instanceof Error ? error.message : t('couldNotDeleteSector')
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteSector')}</DialogTitle>
          <DialogDescription>
            {t('deleteSectorConfirmation', { sectorName: sector?.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            {t('cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isProcessing}
          >
            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
