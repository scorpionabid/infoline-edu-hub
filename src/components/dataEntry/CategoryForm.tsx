
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
import { AlertCircle, CalendarIcon, CheckCircle2, Clock, Save, SendHorizonal, XCircle } from 'lucide-react';
import { CategoryWithColumns } from '@/types/column';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CategoryFormProps {
  category: CategoryWithColumns;
  isSaving: boolean;
  isSubmitting: boolean;
  isModified: boolean;
  onSave: () => void;
  onSubmit: () => void;
  completionPercentage?: number;
  status?: string;
  lastUpdated?: string;
  rejectionReason?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  isSaving,
  isSubmitting,
  isModified,
  onSave,
  onSubmit,
  completionPercentage = 0,
  status = 'draft',
  lastUpdated,
  rejectionReason
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
            <Clock className="w-3 h-3 mr-1" />
            {t('pendingApproval')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
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

  const getDeadlineStatus = () => {
    if (!category.deadline) return null;
    
    const deadlineDate = new Date(category.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {t('deadlinePassed')}: {format(deadlineDate, 'dd.MM.yyyy')}
          </AlertDescription>
        </Alert>
      );
    } else if (daysLeft <= 3) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            {t('deadlineApproaching')}: {format(deadlineDate, 'dd.MM.yyyy')} ({daysLeft} {t('daysLeft')})
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert className="bg-blue-50 border-blue-200">
          <CalendarIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            {t('deadline')}: {format(deadlineDate, 'dd.MM.yyyy')} ({daysLeft} {t('daysLeft')})
          </AlertDescription>
        </Alert>
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
          {getDeadlineStatus()}
          
          {status === 'rejected' && rejectionReason && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>{t('rejectionReason')}:</strong> {rejectionReason}
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
          
          {lastUpdated && (
            <div className="text-xs text-muted-foreground">
              {t('lastUpdated')}: {lastUpdated}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || isSubmitting || !isModified || status === 'approved'}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? t('saving') : t('saveDraft')}
                </Button>
              </div>
            </TooltipTrigger>
            {status === 'approved' && (
              <TooltipContent>
                <p>{t('cannotEditApprovedData')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSubmit}
                  disabled={isSaving || isSubmitting || completionPercentage < 100 || status === 'approved' || status === 'pending'}
                >
                  <SendHorizonal className="mr-2 h-4 w-4" />
                  {isSubmitting ? t('submitting') : t('submitForApproval')}
                </Button>
              </div>
            </TooltipTrigger>
            {completionPercentage < 100 && (
              <TooltipContent>
                <p>{t('completeAllFieldsFirst')}</p>
              </TooltipContent>
            )}
            {(status === 'approved' || status === 'pending') && (
              <TooltipContent>
                <p>{status === 'approved' ? t('alreadyApproved') : t('alreadySubmitted')}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
