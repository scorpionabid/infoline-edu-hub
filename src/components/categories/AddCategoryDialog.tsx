
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

// CategoryWithOrder interfeysi yaradırıq - bunlar EditCategoryDialog-dan istifadə olunur
export type CategoryWithOrder = Category & {
  order?: number;
};

export interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (categoryData: CategoryWithOrder) => Promise<boolean>;
  category?: CategoryWithOrder; // Mövcud kateqoriya redaktə üçün
}

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onOpenChange,
  onAddCategory,
  category // opsional prop - əgər varsa, bu redaktə əməliyyatıdır
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignment, setAssignment] = useState('all');
  const [priority, setPriority] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Kateqoriya redaktə edilərkən formu doldurmaq
  useEffect(() => {
    if (category && open) {
      setName(category.name || '');
      setDescription(category.description || '');
      setAssignment(category.assignment || 'all');
      setPriority(category.priority || 0);
    } else if (!category && open) {
      // Yeni kateqoriya yaradarkən formu sıfırlamaq
      setName('');
      setDescription('');
      setAssignment('all');
      setPriority(0);
    }
  }, [category, open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const categoryData: CategoryWithOrder = {
        ...(category ? { id: category.id } : {}),
        name,
        description,
        assignment,
        priority,
        status: 'active',
        order: category?.order || 0
      };
      
      const success = await onAddCategory(categoryData);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Category save error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = !!category;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editCategory') : t('addCategory')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editCategoryDescription') : t('addCategoryDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterCategoryName')}
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('enterCategoryDescription')}
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment">{t('assignment')}</Label>
            <Select 
              value={assignment} 
              onValueChange={setAssignment} 
              disabled={submitting}
            >
              <SelectTrigger id="assignment">
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allUsers')}</SelectItem>
                <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">{t('priority')}</Label>
            <Input
              id="priority"
              type="number"
              min="0"
              step="1"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              placeholder={t('enterPriority')}
              disabled={submitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!name || submitting}
          >
            {submitting ? (isEditMode ? t('updating') : t('adding')) : (isEditMode ? t('update') : t('add'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
