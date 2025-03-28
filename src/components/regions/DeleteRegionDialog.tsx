
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/LanguageContext';
import { EnhancedRegion } from '@/hooks/useRegionsStore';

interface DeleteRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: EnhancedRegion | null;
  onDelete: (regionId: string) => Promise<boolean>;
}

const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({
  open,
  onOpenChange,
  region,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!region) return;
    
    setLoading(true);
    
    try {
      const success = await onDelete(region.id);
      
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Region silmə xətası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteRegion')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteRegionConfirmation')} <strong>{region?.name}</strong>?
            <div className="mt-2">
              {(region?.sectorCount || 0) > 0 && (
                <div className="text-amber-500 font-medium mb-1">
                  {t('deleteRegionSectorsWarning').replace('{count}', String(region?.sectorCount))}
                </div>
              )}
              {(region?.schoolCount || 0) > 0 && (
                <div className="text-amber-500 font-medium mb-1">
                  {t('deleteRegionSchoolsWarning').replace('{count}', String(region?.schoolCount))}
                </div>
              )}
              <div className="text-destructive font-semibold mt-2">
                {t('deleteRegionWarning')}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRegionDialog;
