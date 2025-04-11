
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().optional(),
  assignment: z.enum(['all', 'sectors']),
  status: z.enum(['active', 'inactive'])
});

type FormValues = z.infer<typeof formSchema>;

export interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading
}) => {
  const { t } = useLanguage();
  const isEditing = Boolean(category);
  
  const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      assignment: (category?.assignment as any) || 'all',
      status: (category?.status as any) || 'active'
    }
  });
  
  // Dialog açıldığında form değerlerini ayarla
  React.useEffect(() => {
    if (open) {
      reset({
        name: category?.name || '',
        description: category?.description || '',
        assignment: (category?.assignment as any) || 'all',
        status: (category?.status as any) || 'active'
      });
    }
  }, [open, category, reset]);
  
  const handleFormSubmit = (data: FormValues) => {
    const submitData = {
      ...data,
      id: category?.id
    };
    onSubmit(submitData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editCategory') : t('addCategory')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('categoryName')} *</Label>
            <Input
              id="name"
              placeholder={t('enterCategoryName')}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              placeholder={t('enterDescription')}
              {...register('description')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignment">{t('assignment')}</Label>
            <Select 
              defaultValue={category?.assignment || 'all'}
              onValueChange={(value) => setValue('assignment', value as 'all' | 'sectors')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSchools')}</SelectItem>
                <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select 
              defaultValue={category?.status || 'active'}
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? t('saveChanges') : t('createCategory')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
