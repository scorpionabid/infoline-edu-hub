
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { useSectors } from '@/hooks/sectors/useSectors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface SectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSector?: any;
  regionId?: string;
}

export function SectorDialog({ isOpen, onClose, editingSector, regionId }: SectorDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createSector, updateSector } = useSectors();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    region_id: regionId || '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (editingSector) {
      setFormData({
        name: editingSector.name || '',
        description: editingSector.description || '',
        region_id: editingSector.region_id || regionId || '',
        status: editingSector.status || 'active'
      });
    } else {
      // Reset form when opening the dialog for a new sector
      setFormData({
        name: '',
        description: '',
        region_id: regionId || (user?.region_id as string) || '',
        status: 'active'
      });
    }
    
    setErrors({});
  }, [editingSector, isOpen, regionId, user?.region_id]);
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('fieldRequired');
    }
    
    if (!formData.region_id) {
      newErrors.region_id = t('fieldRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'active' | 'inactive'
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (editingSector) {
        result = await updateSector(editingSector.id, formData);
      } else {
        result = await createSector(formData);
      }
      
      if (result.success) {
        toast.success(
          editingSector
            ? t('sectorUpdatedSuccessfully')
            : t('sectorCreatedSuccessfully')
        );
        onClose();
      } else {
        toast.error(result.error || t('anErrorOccurred'));
      }
    } catch (error: any) {
      console.error('Sektor əməliyyatı xətası:', error);
      toast.error(error.message || t('anErrorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSector ? t('editSector') : t('addSector')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">{t('name')}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <RadioGroup 
              value={formData.status} 
              onValueChange={handleStatusChange}
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('saving') : (editingSector ? t('update') : t('create'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SectorDialog;
