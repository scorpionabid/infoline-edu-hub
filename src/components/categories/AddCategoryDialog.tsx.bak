
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSubmit: (categoryData: any) => Promise<void>;
}

interface CategoryFormData {
  name: string;
  description: string;
  assignment: string;
  priority: number;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      assignment: 'all',
      priority: 1
    }
  });

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
    reset();
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Kateqoriya Əlavə Et</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Kateqoriya Adı *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Kateqoriya adı tələb olunur' })}
              placeholder="Kateqoriya adını daxil edin"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Təsvir</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Kateqoriya təsvirini daxil edin"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="assignment">Təyinat</Label>
            <Select
              defaultValue="all"
              onValueChange={(value) => setValue('assignment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamısı</SelectItem>
                <SelectItem value="sectors">Sektorlar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Prioritet</Label>
            <Input
              id="priority"
              type="number"
              {...register('priority', { valueAsNumber: true })}
              min={1}
              max={10}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Ləğv et
            </Button>
            <Button type="submit">
              Əlavə et
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
