import React from "react";
import { CategoryWithColumns } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, FilePlus2, SaveIcon, SendIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
  
  const deadlineDate = category.deadline ? new Date(category.deadline) : null;
  const deadlineFormatted = deadlineDate ? 
    deadlineDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  
  const daysToDeadline = deadlineDate ? 
    Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{category.name}</CardTitle>
        {category.description && (
          <CardDescription>{category.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {deadlineFormatted && (
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {t('deadline')}: {deadlineFormatted}
                {daysToDeadline !== null && daysToDeadline > 0 ? (
                  <span className="ml-1 text-muted-foreground">
                    ({daysToDeadline} {t('daysRemaining')})
                  </span>
                ) : daysToDeadline !== null && daysToDeadline <= 0 ? (
                  <span className="ml-1 text-destructive">
                    ({t('overdue')})
                  </span>
                ) : null}
              </span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {t('autoSave')}: {t('enabled')}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <FilePlus2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {t('excelUpload')}: {t('available')}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 border-t">
        <Button 
          variant="outline" 
          onClick={onSave} 
          disabled={isSaving || isSubmitting || !isModified}
        >
          <SaveIcon className="mr-2 h-4 w-4" />
          {isSaving ? t('saving') : t('save')}
        </Button>
        
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting || isSaving}
        >
          <SendIcon className="mr-2 h-4 w-4" />
          {isSubmitting ? t('submitting') : t('submitForApproval')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
