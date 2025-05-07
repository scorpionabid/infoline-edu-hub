
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sector } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsContext } from '@/context/RegionsContext';
import { toast } from 'sonner';

interface SectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sector: Partial<Sector>) => Promise<void>;
  initialData?: Partial<Sector>;
  mode?: 'create' | 'edit';
}

export const SectorDialog: React.FC<SectorDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create',
}) => {
  const { t } = useLanguage();
  const { regions } = useRegionsContext();
  
  const [formData, setFormData] = useState<Partial<Sector>>({
    name: '',
    description: '',
    region_id: '',
    status: 'active',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        region_id: initialData.region_id || '',
        status: initialData.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        region_id: '',
        status: 'active',
      });
    }
  }, [initialData, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name?.trim()) {
        throw new Error(t('sectorNameRequired'));
      }

      if (!formData.region_id) {
        throw new Error(t('regionRequired'));
      }

      await onSubmit(formData);
      onOpenChange(false);
      
      toast.success(
        mode === 'create' ? t('sectorCreatedSuccess') : t('sectorUpdatedSuccess')
      );
    } catch (err: any) {
      console.error('Sektor əməliyyatında xəta:', err);
      setError(err.message || t('unexpectedError'));
      
      toast.error(t('error'), {
        description: err.message || t('unexpectedError'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('createNewSector') : t('editSector')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('fillSectorDetails')
              : t('updateSectorDetails')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('sectorName')} *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('enterSectorName')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('enterDescription')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region_id">{t('region')} *</Label>
              <Select
                value={formData.region_id}
                onValueChange={(value) => handleSelectChange('region_id', value)}
                required
              >
                <SelectTrigger id="region_id">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t('loading')
                : mode === 'create'
                ? t('createSector')
                : t('updateSector')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectorDialog;
