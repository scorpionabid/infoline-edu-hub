
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/hooks/regions/useRegions';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { Region } from '@/types/school';
import { useToast } from '@/components/ui/use-toast';

// Tip təyinləri
export interface RegionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  region?: Region | null;
  triggerRefresh?: () => void;
}

// Yarat dialog
export const CreateRegionDialog: React.FC<RegionDialogProps> = ({ open, onClose, triggerRefresh }) => {
  const { t } = useLanguage();
  const { addRegion } = useRegions();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      await addRegion({
        name,
        description,
        status
      });

      toast({
        title: t('regionCreated'),
        description: t('regionCreatedSuccess')
      });
      
      if (triggerRefresh) triggerRefresh();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: err.message || t('unexpectedError')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('createRegion')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterRegionName')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('enterRegionDescription')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <RadioGroup 
              value={status} 
              onValueChange={setStatus}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">{t('active')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">{t('inactive')}</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Düzənlə dialog
export const EditRegionDialog: React.FC<RegionDialogProps> = ({ open, onClose, region, triggerRefresh }) => {
  const { t } = useLanguage();
  const { updateRegion } = useRegions();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (region) {
      setName(region.name || '');
      setDescription(region.description || '');
      setStatus(region.status || 'active');
    }
  }, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !name) return;

    setLoading(true);
    try {
      await updateRegion(region.id, {
        name,
        description,
        status
      });

      toast({
        title: t('regionUpdated'),
        description: t('regionUpdatedSuccess')
      });
      
      if (triggerRefresh) triggerRefresh();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: err.message || t('unexpectedError')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('editRegion')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterRegionName')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('enterRegionDescription')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <RadioGroup 
              value={status} 
              onValueChange={setStatus}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="edit-active" />
                <Label htmlFor="edit-active">{t('active')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="edit-inactive" />
                <Label htmlFor="edit-inactive">{t('inactive')}</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Sil dialog
export const DeleteRegionDialog: React.FC<RegionDialogProps> = ({ open, onClose, region, triggerRefresh }) => {
  const { t } = useLanguage();
  const { deleteRegion } = useRegions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!region) return;

    setLoading(true);
    try {
      await deleteRegion(region.id);

      toast({
        title: t('regionDeleted'),
        description: t('regionDeletedSuccess')
      });
      
      if (triggerRefresh) triggerRefresh();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: err.message || t('unexpectedError')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>{t('deleteRegionConfirmation')}</p>
          <p className="font-semibold mt-2">{region?.name}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button 
            variant="destructive"  
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
