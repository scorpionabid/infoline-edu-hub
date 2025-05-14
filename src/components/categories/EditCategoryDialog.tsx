
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
import { Category, CategoryAssignment, CategoryStatus } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
  onSave?: () => void;
}

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onClose,
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
  }, [category, isOpen]);

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
        const result = await updateCategory({
          id: category.id,
          name,
          description,
          assignment,
          status,
          priority,
          deadline: deadline ? deadline.toISOString() : null,
          updated_at: now,
        });
        
        if (result.success) {
          onSave && onSave();
          onClose();
        }
      } else {
        const result = await createCategory({
          name,
          description,
          assignment,
          status,
          priority,
          deadline: deadline ? deadline.toISOString() : null,
          created_at: now,
          updated_at: now,
          archived: false
        } as Omit<Category, 'id'>);
        
        if (result.success) {
          onSave && onSave();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioritet</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="deadline">Son tarix</Label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
              />
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
