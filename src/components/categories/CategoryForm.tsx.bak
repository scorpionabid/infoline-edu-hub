
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DialogFooter,
} from '@/components/ui/dialog';

interface CategoryFormProps {
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
  isEditing: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryForm,
  handleFormChange,
  handleSelectChange,
  handleSubmit,
  isEditing
}) => {
  const { t } = useLanguage();

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('categoryName')}</Label>
          <Input 
            id="name" 
            name="name" 
            value={categoryForm.name} 
            onChange={handleFormChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t('categoryDescription')}</Label>
          <Textarea 
            id="description" 
            name="description"
            value={categoryForm.description} 
            onChange={handleFormChange} 
            rows={3} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assignment">{t('assignment')}</Label>
            <Select 
              value={categoryForm.assignment} 
              onValueChange={(value) => handleSelectChange('assignment', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSchools')}</SelectItem>
                <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">{t('deadline')}</Label>
            <Input 
              id="deadline" 
              name="deadline"
              type="date" 
              value={categoryForm.deadline}
              onChange={handleFormChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">{t('status')}</Label>
          <Select 
            value={categoryForm.status}
            onValueChange={(value) => handleSelectChange('status', value)}
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
      </div>
      <DialogFooter>
        <Button type="submit">
          {isEditing ? t('saveChanges') : t('saveCategory')}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;
