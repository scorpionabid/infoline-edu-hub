
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
import { useCategoryActions } from '@/hooks/categories/useCategoryActions';
import { Category, CategoryAssignment, CategoryStatus } from '@/types/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignment, setAssignment] = useState<CategoryAssignment>('all');
  const [status, setStatus] = useState<CategoryStatus>('active');
  const [priority, setPriority] = useState(0);
  const [deadline, setDeadline] = useState<string>('');

  // Load category data when editing
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setAssignment(category.assignment || 'all');
      setStatus(category.status || 'active');
      setPriority(category.priority || 0);
      setDeadline(category.deadline || '');
    } else {
      // Reset form for new category
      setName('');
      setDescription('');
      setAssignment('all');
      setStatus('active');
      setPriority(0);
      setDeadline('');
    }
  }, [category, isOpen]);

  const { createCategory, updateCategory, isLoading } = useCategoryActions({
    onSuccess: () => {
      if (onSave) onSave();
      onClose();
    },
  });

  const handleSave = async () => {
    const categoryData = {
      name,
      description,
      assignment,
      status,
      priority: priority || 0,
      deadline
    };

    if (category?.id) {
      await updateCategory({ ...categoryData, id: category.id });
    } else {
      await createCategory(categoryData);
    }
  };

  const handleDateSelect = (date: Date) => {
    setDeadline(date.toISOString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Kateqoriya redaktə et' : 'Yeni kateqoriya'}</DialogTitle>
          <DialogDescription>
            Kateqoriya məlumatlarını daxil edin və yadda saxlayın
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
              placeholder="Təsvir əlavə edin (istəyə bağlı)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignment">Təyinat</Label>
            <Select value={assignment} onValueChange={(value: any) => setAssignment(value)}>
              <SelectTrigger id="assignment">
                <SelectValue placeholder="Təyinat seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Hamı</SelectItem>
                <SelectItem value="sectors">Yalnız Sektorlar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Status seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Qeyri-aktiv</SelectItem>
                <SelectItem value="draft">Qaralama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Prioritet</Label>
            <Input
              id="priority"
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              placeholder="Prioritet (0, 1, 2, ...)"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Son tarix</Label>
            <DatePicker 
              id="deadline"
              onSelect={handleDateSelect}
              defaultDate={deadline ? new Date(deadline) : undefined} 
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Ləğv et</Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={!name || isLoading}
          >
            {isLoading ? 'Gözləyin...' : category ? 'Yadda saxla' : 'Əlavə et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
