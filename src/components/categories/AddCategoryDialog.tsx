import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category, CategoryAssignment } from '@/types/category';
import { DatePicker } from '@/components/ui/date-picker';
import { useLanguage } from '@/context/LanguageContext';
import { Textarea } from '@/components/ui/textarea';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initialData?: Partial<Category>;
  isEdit?: boolean;
}

export function AddCategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}: AddCategoryDialogProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assignment, setAssignment] = useState<CategoryAssignment>(initialData?.assignment as CategoryAssignment || 'all');
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [deadline, setDeadline] = useState<Date | undefined>(
    initialData?.deadline ? new Date(initialData.deadline) : undefined
  );
  const [priority, setPriority] = useState(initialData?.priority || 1);

  const handleSubmit = async () => {
    if (!name) return;
    
    setIsLoading(true);
    
    const categoryData = {
      name,
      description,
      assignment,
      status: status as "active" | "inactive",
      deadline: deadline || null,
      priority,
      columnCount: initialData?.columnCount || 0,
      order: initialData?.order || priority,
      archived: initialData?.archived || false
    };
    
    try {
      await onSubmit(categoryData as Omit<Category, "id" | "createdAt" | "updatedAt">);
      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('editCategory') : t('addCategory')}</DialogTitle>
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignment" className="text-right">
              {t('assignment')}
            </Label>
            <select
              id="assignment"
              value={assignment}
              onChange={(e) => setAssignment(e.target.value as CategoryAssignment)}
              className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">{t('allRegions')}</option>
              <option value="sectors">{t('sectorsOnly')}</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              {t('status')}
            </Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              {t('deadline')}
            </Label>
            <DatePicker
              id="deadline"
              value={deadline}
              onValueChange={setDeadline}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              {t('priority')}</Label>
            <Input
              type="number"
              id="priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">
                  ●
                </span>
                {t('submitting')}
              </>
            ) : (
              t('save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
