import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Category } from '@/types/category';
import { useCategoryActions } from '@/hooks/useCategoryActions';

interface EditCategoryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  category?: Category;
}

type Inputs = {
  name: string;
  description: string;
  assignment: 'sectors' | 'all';
  deadline: Date | null;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
};

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({ open, setOpen, category }) => {
  const { handleAddCategory, isActionLoading } = useCategoryActions();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  React.useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description || '');
      setValue('assignment', category.assignment || 'all');
      setValue('deadline', category.deadline ? new Date(category.deadline) : null);
      setValue('status', category.status);
      setValue('priority', category.priority || 0);
    }
  }, [category, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const categoryData = {
      ...data,
      id: category?.id,
      deadline: data.deadline ? data.deadline.toISOString() : null,
    };

    const success = await handleAddCategory(categoryData);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? "Kateqoriya Yenilə" : "Kateqoriya Yarat"}</DialogTitle>
          <DialogDescription>
            {category ? "Kateqoriya məlumatlarını yeniləyin." : "Yeni kateqoriya əlavə edin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ad</Label>
            <Input id="name" placeholder="Kateqoriya adı" {...register("name", { required: true })} />
            {errors.name && <p className="text-sm text-red-500">Ad tələb olunur</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Açıqlama</Label>
            <Textarea id="description" placeholder="Kateqoriya açıklaması" {...register("description")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignment">Təyinat</Label>
            <Select {...register("assignment")} defaultValue={category?.assignment || 'all'}>
              <SelectTrigger id="assignment">
                <SelectValue placeholder="Təyinat seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sectors">Sektorlar</SelectItem>
                <SelectItem value="all">Hamısı</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deadline">Son Tarix</Label>
            <DatePicker
              id="deadline"
              onSelect={(date) => setValue("deadline", date)}
              defaultDate={category?.deadline ? new Date(category.deadline) : undefined}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select {...register("status")} defaultValue={category?.status || 'active'}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Deaktiv</SelectItem>
                <SelectItem value="draft">Qaralama</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Prioritet</Label>
            <Input
              id="priority"
              type="number"
              placeholder="Prioritet nömrəsi"
              {...register("priority", { valueAsNumber: true })}
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" disabled={isActionLoading}>
            {isActionLoading ? "Yüklənir..." : (category ? "Yenilə" : "Yarat")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
