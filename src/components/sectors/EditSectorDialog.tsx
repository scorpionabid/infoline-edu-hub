
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Region, Sector } from '@/types/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectorData: Sector) => Promise<void>;
  sector: Sector;
  regions: Region[];
  isSubmitting?: boolean;
}

const EditSectorDialog: React.FC<EditSectorDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sector,
  regions,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();
  const [name, setName] = useState(sector.name);
  const [description, setDescription] = useState(sector.description || '');
  const [regionId, setRegionId] = useState(sector.region_id);
  const [status, setStatus] = useState(sector.status);

  // Update local state if the sector prop changes
  useEffect(() => {
    setName(sector.name);
    setDescription(sector.description || '');
    setRegionId(sector.region_id);
    setStatus(sector.status);
  }, [sector]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...sector,
        name,
        description,
        region_id: regionId,
        status,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating sector:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editSector')}</DialogTitle>
          <DialogDescription>
            {t('editSectorDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('sectorName')}<span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">{t('region')}<span className="text-destructive">*</span></Label>
            <Select value={regionId} onValueChange={setRegionId} required>
              <SelectTrigger>
                <SelectValue placeholder={t('selectRegion')} />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name || !regionId}
            >
              {isSubmitting ? t('updating') : t('update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSectorDialog;
