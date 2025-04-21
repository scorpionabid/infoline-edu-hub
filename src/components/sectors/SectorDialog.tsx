
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';

interface SectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sector?: any;
}

export const SectorDialog: React.FC<SectorDialogProps> = ({ isOpen, onClose, sector }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const [name, setName] = useState(sector?.name || '');
  const [description, setDescription] = useState(sector?.description || '');
  const [loading, setLoading] = useState(false);
  const [regionId, setRegionId] = useState(sector?.region_id || '');

  const handleAddSector = async () => {
    if (!name.trim()) {
      toast.error(t('sectorNameRequired'));
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sectors').insert({
        name: name.trim(),
        description,
        region_id: user?.region_id || regionId,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select();

      if (error) {
        throw error;
      }
      
      toast.success(t('sectorAddedSuccessfully'));
      onClose();
    } catch (error: any) {
      console.error('Error adding sector:', error);
      toast.error(t('errorAddingSector'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSector = async () => {
    if (!sector) return;
    
    if (!name.trim()) {
      toast.error(t('sectorNameRequired'));
      return;
    }
    
    setLoading(true);
    try {
      // Bu kod user.region_id istifadə edir
      const { error } = await supabase.from('sectors').update({
        name: name.trim(),
        description,
        region_id: user?.region_id || regionId,
        updated_at: new Date().toISOString()
      }).eq('id', sector.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(t('sectorUpdatedSuccessfully'));
      onClose();
    } catch (error: any) {
      console.error('Error updating sector:', error);
      toast.error(t('errorUpdatingSector'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sector ? t('editSector') : t('addSector')}</DialogTitle>
          <DialogDescription>
            {sector ? t('editSectorDescription') : t('addSectorDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('sectorName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          
          <Button onClick={sector ? handleUpdateSector : handleAddSector} disabled={loading}>
            {loading ? (
              t('saving')
            ) : sector ? (
              t('updateSector')
            ) : (
              t('addSector')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SectorDialog;
