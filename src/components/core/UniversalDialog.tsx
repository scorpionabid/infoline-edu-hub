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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DialogConfig, DialogType, EntityType } from './types';
import { getDialogConfig } from './dialogConfigs';

interface UniversalDialogProps {
  type: DialogType;
  entity: EntityType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data?: any; // Entity data (name, id, etc.)
  isSubmitting?: boolean;
  customConfig?: Partial<DialogConfig>;
}

export const UniversalDialog: React.FC<UniversalDialogProps> = ({
  type,
  entity,
  isOpen,
  onClose,
  onConfirm,
  data,
  isSubmitting = false,
  customConfig = {}
}) => {
  const { t } = useLanguage();
  
  // Get base config and merge with custom overrides
  const baseConfig = getDialogConfig(type, entity);
  const config = { ...baseConfig, ...customConfig };
  
  // Extract entity name safely
  const entityName = data?.name || data?.full_name || data?.title || t('items.unknown');
  
  // Build title with translation fallback
  const title = config.titleKey ? t(config.titleKey) : config.title;
  
  // Build warning text with entity name
  const warningText = config.warningTextKey 
    ? t(config.warningTextKey, { name: entityName })
    : config.warningText?.replace('{name}', entityName);
  
  // Build consequences text
  const consequences = config.consequencesKey ? t(config.consequencesKey) : config.consequences;
  
  // Use AlertDialog for destructive actions, Dialog for others
  const isDestructive = type === 'delete' || config.dangerLevel === 'high';
  
  if (isDestructive) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {config.showIcon && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <strong>"{entityName}"</strong> {warningText}
              </div>
              {consequences && (
                <div className="mt-2 text-sm">
                  {consequences}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose} disabled={isSubmitting}>
              {t('cancel') || 'Ləğv et'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {config.loadingText || t('deleting') || 'Silinir...'}
                </>
              ) : (
                config.confirmText || t('delete') || 'Sil'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  // Non-destructive dialog (create, edit, info, etc.)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.showIcon && config.icon && (
              <config.icon className="h-5 w-5" />
            )}
            {title}
          </DialogTitle>
          {(warningText || consequences) && (
            <DialogDescription>
              {warningText && (
                <div>
                  <strong>"{entityName}"</strong> {warningText}
                </div>
              )}
              {consequences && (
                <div className="mt-2 text-sm">
                  {consequences}
                </div>
              )}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('cancel') || 'Ləğv et'}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isSubmitting}
            variant={config.dangerLevel === 'high' ? 'destructive' : 'default'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {config.loadingText || t('processing') || 'İşlənir...'}
              </>
            ) : (
              config.confirmText || t('confirm') || 'Təsdiq'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalDialog;