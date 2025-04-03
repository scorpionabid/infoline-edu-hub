
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/types/category';

export interface AddCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  onClose: () => void;
  category?: Category;
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Kateqoriya adı tələb olunur' }),
  description: z.string().optional(),
  assignment: z.enum(['all', 'sectors'], {
    required_error: 'Təyinat seçilməlidir',
  }),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status seçilməlidir',
  }),
  deadline: z.date().optional(),
  priority: z.number().int().positive().default(1),
});

type FormValues = z.infer<typeof formSchema>;

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  onClose, 
  category 
}) => {
  const isEditMode = !!category;
  
  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      assignment: category?.assignment || 'all',
      status: category?.status as ('active' | 'inactive') || 'active',
      deadline: category?.deadline ? new Date(category.deadline) : undefined,
      priority: category?.priority || 1,
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    try {
      const categoryData = {
        ...data,
        columnCount: category?.columnCount || 0,
        order: category?.order || data.priority,
        archived: category?.archived || false,
      };
      
      const success = await onSubmit(categoryData);
      if (success) {
        reset();
        onClose();
      }
      return success;
    } catch (error) {
      console.error('Category submission error:', error);
      return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Kateqoriyanı Redaktə Et' : 'Yeni Kateqoriya'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Kateqoriya adı *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Kateqoriya adını daxil edin"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Təsvir</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Kateqoriya təsvirini daxil edin"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Təyinat *</Label>
              <Controller
                name="assignment"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="assignment-all" />
                      <Label htmlFor="assignment-all">Hamısı</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sectors" id="assignment-sectors" />
                      <Label htmlFor="assignment-sectors">Sektorlar</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.assignment && <p className="text-red-500 text-sm">{errors.assignment.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label>Son tarix</Label>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                )}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioritet</Label>
              <Input
                id="priority"
                type="number"
                {...register('priority', { valueAsNumber: true })}
                min={1}
                defaultValue={1}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="status-switch">{field.value === 'active' ? 'Aktiv' : 'Deaktiv'}</Label>
                    <Switch
                      id="status-switch"
                      checked={field.value === 'active'}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? 'active' : 'inactive');
                      }}
                    />
                  </div>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Gözləyin...' : isEditMode ? 'Yadda saxla' : 'Əlavə et'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
