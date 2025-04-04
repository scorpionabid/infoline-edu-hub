
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CategoryForm from './CategoryForm';
import { Category } from '@/types/category';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryForm: {
    name: string;
    description: string;
    assignment: string;
    deadline: string;
    status: string;
  };
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  selectedCategoryId: string | null;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  categoryForm,
  handleFormChange,
  handleSelectChange,
  handleSubmit,
  selectedCategoryId
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          {t('addCategory')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {selectedCategoryId ? t('editCategory') : t('addCategory')}
          </DialogTitle>
          <DialogDescription>
            {selectedCategoryId ? t('editCategoryDescription') : t('addCategoryDescription')}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm 
          categoryForm={categoryForm}
          handleFormChange={handleFormChange}
          handleSelectChange={handleSelectChange}
          handleSubmit={handleSubmit}
          isEditing={!!selectedCategoryId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoryDialog;
