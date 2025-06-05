
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Sector, Region } from '@/types/supabase';

export interface SectorFormProps {
  initialData?: Partial<Sector>;
  regions?: Region[];
  onSubmit: (data: Partial<Sector>) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const SectorForm: React.FC<SectorFormProps> = ({
  initialData,
  regions = [],
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();
  const [formData, setFormData] = useState<Partial<Sector>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    region_id: initialData?.region_id || '',
    status: initialData?.status || 'active',
    ...initialData
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.region_id) {
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting sector form:', error);
    }
  };

  const handleInputChange = (field: keyof Sector, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')}</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder={t('enterSectorName')}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('enterSectorDescription')}
          disabled={isSubmitting}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">{t('region')}</Label>
        <Select
          value={formData.region_id || ''}
          onValueChange={(value) => handleInputChange('region_id', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
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
          value={formData.status || 'active'}
          onValueChange={(value) => handleInputChange('status', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!formData.name?.trim() || !formData.region_id || isSubmitting}
        >
          {isSubmitting ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
};

export default SectorForm;
