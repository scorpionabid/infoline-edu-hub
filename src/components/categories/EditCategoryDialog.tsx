import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useCategoryActions from '@/hooks/categories/useCategoryActions';
import { Category, CategoryAssignment, CategoryStatus, UpdateCategoryData } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSave?: () => void;
}

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSave,
}) => {
  const { updateCategory, createCategory, isLoading } = useCategoryActions();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assignment, setAssignment] = useState<CategoryAssignment>('all');
  const [status, setStatus] = useState<CategoryStatus>('active');
  const [priority, setPriority] = useState<number>(0);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setAssignment((category.assignment || 'all') as CategoryAssignment);
      setStatus((category.status || 'active') as CategoryStatus);
      setPriority(category.priority || 0);
      
      if (category.deadline) {
        setDeadline(new Date(category.deadline));
      } else {
        setDeadline(undefined);
      }
    } else {
      resetForm();
    }
  }, [category, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setAssignment('all');
    setStatus('active');
    setPriority(0);
    setDeadline(undefined);
  };

  const handleSubmit = async () => {
    const now = new Date().toISOString();
    
    try {
      if (category?.id) {
        const updateData: UpdateCategoryData = {
          name,
          description,
          assignment,
          status,
          priority,
          deadline: deadline ? deadline.toISOString() : null,
          updated_at: now
        };
        await updateCategory({ id: category.id, ...updateData });
      } else {
        const categoryData = {
          name,
          description,
          assignment,
          status,
          priority,
          deadline: deadline ? deadline.toISOString() : null,
          created_at: now,
          updated_at: now
        };
        await createCategory(categoryData as any);
      }
      
      if (onSave) {
        onSave();
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Kateqoriyanı Düzəlt' : 'Yeni Kateqoriya'}</DialogTitle>
          <DialogDescription>
            Kateqoriya məlumatlarını doldurun və yadda saxlamaq üçün təsdiqləyin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Ad</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kateqoriya adı"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Təsvir</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kateqoriya haqqında təsvir"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="assignment">Təyinat</Label>
              <Select 
                value={assignment}
                onValueChange={(value) => setAssignment(value as CategoryAssignment)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Təyinat seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Bütün istifadəçilər</SelectItem>
                  <SelectItem value="sectors">Yalnız sektorlar</SelectItem>
                  <SelectItem value="schools">Yalnız məktəblər</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status}
                onValueChange={(value) => setStatus(value as CategoryStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                  <SelectItem value="draft">Qaralama</SelectItem>
                  <SelectItem value="approved">Təsdiqlənmiş</SelectItem>
                  <SelectItem value="archived">Arxivlənmiş</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Son tarix
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : <span>Tarix seçin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    // initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">İmtina</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Yüklənir...' : category ? 'Yadda saxla' : 'Əlavə et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
