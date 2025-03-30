
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/context/LanguageContext';
import { EnhancedRegion } from '@/types/region';

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
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!region) return;
    
    setIsDeleting(true);
    
    try {
      const success = await onDelete(region.id);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!region) return null;

  // Sektör, məktəb və admin saylarını dinamik olaraq interpolasiya edirik
  const sectorWarning = region.sectorCount > 0 
    ? t('deleteRegionSectorsWarning').replace('{{count}}', region.sectorCount.toString()) 
    : '';
    
  const schoolWarning = region.schoolCount > 0 
    ? t('deleteRegionSchoolsWarning').replace('{{count}}', region.schoolCount.toString()) 
    : '';
    
  const adminWarning = region.adminCount > 0 
    ? t('deleteRegionAdminsWarning').replace('{{count}}', region.adminCount.toString()) 
    : '';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteRegion')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteRegionConfirmation')}
            {(region.sectorCount > 0 || region.schoolCount > 0 || region.adminCount > 0) && (
              <div className="mt-2 text-destructive">
                <p className="font-medium">{t('warning')}:</p>
                <ul className="list-disc pl-5">
                  {region.sectorCount > 0 && (
                    <li>{sectorWarning}</li>
                  )}
                  {region.schoolCount > 0 && (
                    <li>{schoolWarning}</li>
                  )}
                  {region.adminCount > 0 && (
                    <li>{adminWarning}</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRegionDialog;
