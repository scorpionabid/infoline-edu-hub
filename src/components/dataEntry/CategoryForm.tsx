
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { AlertCircle, CalendarIcon, CheckCircle2, Save, SendHorizonal } from 'lucide-react';
import { CategoryWithColumns } from '@/types/column';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface CategoryFormProps {
  category: CategoryWithColumns;
  isSaving: boolean;
  isSubmitting: boolean;
  isModified: boolean;
  onSave: () => void;
  onSubmit: () => void;
  completionPercentage?: number;
  status?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isSaving,
  isSubmitting,
  isModified,
  onSave,
  onSubmit,
  completionPercentage = 0,
  status = 'draft'
}) => {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch(status) {
      case 'approved':
        return (
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t('approved')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
            <CalendarIcon className="w-3 h-3 mr-1" />
            {t('pendingApproval')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('rejected')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-700 border-gray-200">
            {t('draft')}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              {category.name}
              {getStatusBadge()}
            </CardTitle>
            {category.description && (
              <CardDescription className="mt-1">
                {category.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {category.deadline && (
            <Alert className="bg-blue-50 border-blue-200">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                {t('deadline')}: {format(new Date(category.deadline), 'dd.MM.yyyy')}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('completionRate')}</span>
              <span className="text-sm font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onSave}
          disabled={isSaving || isSubmitting || !isModified || status === 'approved'}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t('saving') : t('saveDraft')}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={onSubmit}
          disabled={isSaving || isSubmitting || status === 'approved'}
        >
          <SendHorizonal className="mr-2 h-4 w-4" />
          {isSubmitting ? t('submitting') : t('submitForApproval')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
