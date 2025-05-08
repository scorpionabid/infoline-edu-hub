
import React, { useState } from 'react';
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

interface AddSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectorData: Omit<Sector, 'id'>) => Promise<void>;
  regions: Region[];
  isSubmitting?: boolean;
}

const AddSectorDialog: React.FC<AddSectorDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  regions,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState('active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        name,
        description,
        region_id: regionId,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      resetForm();
    } catch (error) {
      console.error("Error submitting sector:", error);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setRegionId('');
    setStatus('active');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addSector')}</DialogTitle>
          <DialogDescription>
            {t('addSectorDescription')}
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
              onClick={handleClose}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !name || !regionId}
            >
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSectorDialog;
