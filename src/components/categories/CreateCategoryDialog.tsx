
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCategory } from '@/hooks/categories/useCreateCategory';
import { useTranslation } from '@/contexts/TranslationContext';
import { toast } from 'sonner';

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { createCategory, isLoading } = useCreateCategory();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('categoryNameRequired'));
      return;
    }

    try {
      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
      });
      
      toast.success(t('categoryCreatedSuccessfully'));
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Create category error:', error);
      toast.error(t('categoryCreateError'));
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('createCategory')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">{t('categoryName')}</Label>
            <Input
              id="categoryName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('enterCategoryName')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoryDescription">{t('description')}</Label>
            <Textarea
              id="categoryDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('enterCategoryDescription')}
              rows={3}
            />
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              {t('cancel')}
            </Button>
            
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
