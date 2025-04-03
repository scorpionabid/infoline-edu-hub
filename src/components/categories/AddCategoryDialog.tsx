
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CategoryAssignment } from '@/types/category';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (categoryData: any) => Promise<boolean>;
}

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ 
  open, 
  onOpenChange,
  onAddCategory 
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignment, setAssignment] = useState<CategoryAssignment>('all');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [deadline, setDeadline] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setAssignment('all');
    setStatus('active');
    setDeadline(new Date());
    setPriority(0);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const categoryData = {
        name,
        description,
        assignment,
        status,
        deadline: deadline ? deadline.toISOString() : null,
        priority,
        columnCount: 0,
        order: priority,
        archived: false
      };

      const success = await onAddCategory(categoryData);
      
      if (success) {
        resetForm();
        onOpenChange(false);
        toast.success(t('categoryAddedSuccess'), {
          description: t('categoryAddedSuccessDesc')
        });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(t('categoryAddError'), {
        description: t('categoryAddErrorDesc')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addNewCategory')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('name')}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder={t('categoryNamePlaceholder')}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t('description')}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder={t('categoryDescPlaceholder')}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignment" className="text-right">
              {t('assignment')}
            </Label>
            <Select 
              value={assignment} 
              onValueChange={(value) => setAssignment(value as CategoryAssignment)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="sectors">{t('sectors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              {t('status')}
            </Label>
            <Select 
              value={status} 
              onValueChange={(value) => setStatus(value as 'active' | 'inactive')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              {t('deadline')}
            </Label>
            <div className="col-span-3">
              <DatePicker date={deadline} setDate={setDeadline} />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              {t('priority')}
            </Label>
            <Input
              id="priority"
              type="number"
              min="0"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={!name || isSubmitting}
          >
            {isSubmitting ? t('adding') : t('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
