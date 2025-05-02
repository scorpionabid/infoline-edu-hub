
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useCategoryActions } from '@/hooks/categories/useCategoryActions';
import { Category } from '@/types/category';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onSuccess?: () => void;
}

export default function EditCategoryDialog({ isOpen, onClose, category, onSuccess }: EditCategoryDialogProps) {
  const { t } = useLanguage();
  const { handleAddCategory, isActionLoading } = useCategoryActions();

  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');
  const [assignment, setAssignment] = useState<'all' | 'sectors'>(category.assignment || 'all');
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>(category.status || 'active');
  const [priority, setPriority] = useState<number>(category.priority || 0);
  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(
    category.deadline ? new Date(category.deadline) : undefined
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error(t('validationError'), {
        description: t('categoryNameRequired')
      });
      return;
    }

    try {
      const categoryData: Category = {
        id: category.id,
        name,
        description,
        assignment,
        deadline: deadlineDate ? deadlineDate.toISOString() : undefined,
        status,
        priority,
        archived: category.archived || false
      };

      const success = await handleAddCategory(categoryData);
      if (success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Category update error:', error);
      toast.error(t('error'), {
        description: t('errorUpdatingCategory')
      });
    }
  };

  const handleSelectDate = (date?: Date) => {
    if (date) {
      setDeadlineDate(date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{t('editCategory')}</DialogTitle>
          <DialogDescription>
            {t('editCategoryDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right">
              {t('name')}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('categoryNamePlaceholder') || "Kateqoriya adı"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-right">
              {t('description')}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('categoryDescriptionPlaceholder') || "Kateqoriya təsviri"}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-right">
              {t('deadline')}
            </Label>
            <DatePicker
              date={deadlineDate}
              onSelect={handleSelectDate}
            />
            {deadlineDate && (
              <div className="text-sm text-muted-foreground">
                {format(deadlineDate, 'PPP')}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-right">
              {t('priority')}
            </Label>
            <Input
              id="priority"
              type="number"
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-right">{t('assignment')}</Label>
            <RadioGroup
              value={assignment}
              onValueChange={(value) => setAssignment(value as 'all' | 'sectors')}
              className="flex gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">{t('allSchools')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sectors" id="sectors" />
                <Label htmlFor="sectors">{t('sectorsOnly')}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label className="text-right">{t('status')}</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'draft')}
              className="flex flex-wrap gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active">{t('active')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive">{t('inactive')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft">{t('draft')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isActionLoading}>
            {isActionLoading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
