
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryWithColumns } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Save, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatDateUtils';

interface CategoryFormProps {
  category: CategoryWithColumns;
  isSaving: boolean;
  isSubmitting: boolean;
  isModified: boolean;
  onSave: () => void;
  onSubmit: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isSaving,
  isSubmitting,
  isModified,
  onSave,
  onSubmit
}) => {
  const { t } = useLanguage();

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return '';
    
    try {
      return formatDate(new Date(deadline));
    } catch (error) {
      return deadline;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>{category.name}</CardTitle>
          
          {category.deadline && (
            <Badge variant="outline" className="text-sm">
              {t('deadline')}: {formatDeadline(category.deadline)}
            </Badge>
          )}
        </div>
        
        {category.description && (
          <p className="text-muted-foreground text-sm">{category.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving || !isModified}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            {t('save')}
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || !isModified}
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            {t('submitForApproval')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
