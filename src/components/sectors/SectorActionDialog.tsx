
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSector, useDeleteSector, useEditSector } from '@/hooks/useSectorMutations';

// SectorActionDialog komponentinin interfeysi
interface SectorActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'create' | 'edit' | 'delete';
  regionId?: string;
  sector?: any;
}

const SectorActionDialog: React.FC<SectorActionDialogProps> = ({
  isOpen,
  onClose,
  action,
  regionId,
  sector
}) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // State variables for form inputs
  const [name, setName] = useState(sector?.name || '');
  const [description, setDescription] = useState(sector?.description || '');
  const [status, setStatus] = useState(sector?.status || 'active');
  
  // Use mutations
  const createSectorMutation = useCreateSector();
  const editSectorMutation = useEditSector();
  const deleteSectorMutation = useDeleteSector();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (action === 'create') {
        await createSectorMutation.mutateAsync({
          regionId: regionId!,
          name,
          description,
          status
        });
        toast.success(t('sectorCreated'), {
          description: t('sectorCreatedDesc')
        });
      } else if (action === 'edit') {
        await editSectorMutation.mutateAsync({
          id: sector.id,
          name,
          description,
          status
        });
        toast.success(t('sectorUpdated'), {
          description: t('sectorUpdatedDesc')
        });
      } else if (action === 'delete') {
        await deleteSectorMutation.mutateAsync(sector.id);
        toast.success(t('sectorDeleted'), {
          description: t('sectorDeletedDesc')
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      onClose();
    } catch (error: any) {
      console.error('Sector action error:', error);
      toast.error(t('operationFailed'), {
        description: error.message || t('tryAgainLater')
      });
    }
  };
  
  // Dialog title based on action
  const getDialogTitle = () => {
    switch (action) {
      case 'create': return t('createSector');
      case 'edit': return t('editSector');
      case 'delete': return t('deleteSector');
      default: return '';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {action === 'delete' ? (
            <div className="py-4">
              <p className="text-center mb-2">
                {t('deleteSectorConfirmation')}:
                <span className="font-medium"> {sector?.name}</span>
              </p>
              <p className="text-center text-muted-foreground text-sm">
                {t('deleteSectorWarning')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterSectorName')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('enterSectorDescription')}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">{t('status')}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant={action === 'delete' ? 'destructive' : 'default'}
              disabled={
                (action === 'create' || action === 'edit') && !name ||
                createSectorMutation.isPending ||
                editSectorMutation.isPending ||
                deleteSectorMutation.isPending
              }
            >
              {createSectorMutation.isPending || editSectorMutation.isPending || deleteSectorMutation.isPending
                ? t('processing')
                : action === 'create'
                  ? t('create')
                  : action === 'edit'
                    ? t('save')
                    : t('delete')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectorActionDialog;
