
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryWithColumns } from '@/types/dataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, Save, SendHorizonal } from 'lucide-react';
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
  
  // Son tarixi formatlama
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    
    try {
      const date = new Date(deadline);
      return new Intl.DateTimeFormat('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return deadline;
    }
  };
  
  const formattedDeadline = formatDeadline(category.deadline);
  
  return (
    <Card className="w-full mb-8">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{category.name}</CardTitle>
            {category.description && (
              <CardDescription className="mt-1.5">
                {category.description}
              </CardDescription>
            )}
          </div>
          
          {category.status && (
            <Badge className="ml-2">
              {t(category.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {formattedDeadline && (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Clock className="mr-2 h-4 w-4" />
            <span>{t('deadline')}: {formattedDeadline}</span>
          </div>
        )}
        
        {/* Burada digər məlumatlar göstərilə bilər */}
        <div className="text-sm">
          <p>{t('columns')}: {category.columns.length}</p>
          {category.priority !== undefined && (
            <p>{t('priority')}: {category.priority}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3">
        <Button
          variant="outline"
          onClick={onSave}
          disabled={isSaving || isSubmitting || !isModified}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t('saving') : t('saveAsDraft')}
        </Button>
        
        <Button
          onClick={onSubmit}
          disabled={isSaving || isSubmitting}
        >
          <SendHorizonal className="mr-2 h-4 w-4" />
          {isSubmitting ? t('submitting') : t('submitForApproval')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
