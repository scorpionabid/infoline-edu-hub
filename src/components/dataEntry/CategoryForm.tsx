
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/dataEntry';
import { Loader2, Check, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { az } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

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

  const formatDeadline = (deadline: string | undefined) => {
    if (!deadline) return '';
    try {
      return format(new Date(deadline), 'PPP', { locale: az });
    } catch (err) {
      console.error('Tarix formatı xətası:', err);
      return deadline;
    }
  };

  return (
    <div className="flex justify-between items-start border rounded-lg p-4 bg-white">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
        {category.description && (
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        )}
        {category.deadline && (
          <div className="mt-2">
            <Badge variant="secondary">
              {t('deadline')}: {formatDeadline(category.deadline)}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={onSave}
          disabled={isSaving || !isModified}
          className={cn("min-w-[100px]")}
          variant="outline"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {t('save')}
            </>
          )}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSaving || isSubmitting}
          className="min-w-[130px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t('submitForApproval')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CategoryForm;
