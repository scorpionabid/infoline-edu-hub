
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryWithColumns } from '@/types/column';
import { CalendarIcon, CheckCircle2, Circle, Clock, Loader2, Save, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

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
  
  // Kateqoriya statusunu hesablayır
  const getStatusBadge = () => {
    const status = category.status || 'draft';
    
    const colors = {
      draft: "bg-yellow-500 text-white",
      pending: "bg-blue-500 text-white",
      approved: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
      partial: "bg-orange-500 text-white",
      active: "bg-green-500 text-white",
      inactive: "bg-gray-500 text-white"
    };
    
    const icons = {
      draft: <Circle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle2 className="h-3 w-3 mr-1" />,
      rejected: <Circle className="h-3 w-3 mr-1" />,
      partial: <Circle className="h-3 w-3 mr-1" />,
      active: <CheckCircle2 className="h-3 w-3 mr-1" />,
      inactive: <Circle className="h-3 w-3 mr-1" />
    };
    
    const colorClass = colors[status as keyof typeof colors] || colors.draft;
    const icon = icons[status as keyof typeof icons] || icons.draft;
    
    return (
      <Badge className={`${colorClass} flex items-center`}>
        {icon}
        {t(status)}
      </Badge>
    );
  };
  
  // Təyin edilmiş son tarixi göstərir
  const getDeadlineBadge = () => {
    if (!category.deadline) return null;
    
    const deadline = new Date(category.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let colorClass = "bg-green-100 text-green-800";
    if (diffDays < 0) {
      colorClass = "bg-red-100 text-red-800";
    } else if (diffDays < 3) {
      colorClass = "bg-yellow-100 text-yellow-800";
    }
    
    return (
      <Badge variant="outline" className={`flex items-center ${colorClass}`}>
        <CalendarIcon className="h-3 w-3 mr-1" />
        {deadline.toLocaleDateString()} 
        {diffDays < 0 
          ? ` (${t('overdue')})` 
          : diffDays < 3 
            ? ` (${diffDays} ${t('daysLeft')})` 
            : ''
        }
      </Badge>
    );
  };

  // Düymələrin əlçatan olub-olmadığını müəyyən edir
  const canSubmit = !isSaving && !isSubmitting;
  const canSave = !isSaving && !isSubmitting && isModified;
  
  // Düymələr üçün tooltip mesajlarını müəyyən edir
  const getSubmitTooltip = () => {
    if (isSubmitting) return t('submitting');
    if (category.status === 'approved') return t('alreadyApproved');
    if (category.status === 'pending') return t('alreadySubmitted');
    return '';
  };
  
  const getSaveTooltip = () => {
    if (isSaving) return t('saving');
    if (!isModified) return t('noChangesToSave');
    return '';
  };

  // Tamamlanma faizini hesablayır
  const completionPercentage = category.completionPercentage || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{category.name}</CardTitle>
            {category.description && (
              <CardDescription className="mt-1">{category.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {getDeadlineBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t('categoryCompletion')}: {completionPercentage}%
            </span>
            <span className="text-sm text-muted-foreground">
              {category.columns.length} {t('columns')}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          {category.status === 'pending' && (
            <span>{t('pendingApproval')}</span>
          )}
          {category.status === 'approved' && (
            <span>{t('approved')}</span>
          )}
          {category.status === 'rejected' && (
            <span>{t('rejected')}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={!canSave}
            title={getSaveTooltip()}
            className="w-24"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-3 w-3" />
                {t('saveDraft')}
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit || category.status === 'approved' || category.status === 'pending'}
            title={getSubmitTooltip()}
            className="w-24"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send className="mr-2 h-3 w-3" />
                {t('submit')}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
