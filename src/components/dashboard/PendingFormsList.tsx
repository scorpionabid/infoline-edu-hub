
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';

interface PendingFormsListProps {
  forms: FormItem[];
  onOpenForm?: (formId: string) => void;
}

const PendingFormsList: React.FC<PendingFormsListProps> = ({ forms, onOpenForm }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleOpenForm = (id: string) => {
    if (onOpenForm) {
      onOpenForm(id);
    } else {
      navigate(`/data-entry/${id}`);
    }
  };
  
  if (!forms || forms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingForms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>{t('noPendingForms')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingForms')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forms.map((form) => (
            <div key={form.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
              <div>
                <h4 className="font-medium">{form.name || form.title}</h4>
                <p className="text-sm text-muted-foreground">{form.categoryName || form.category}</p>
                {form.dueDate && (
                  <p className="text-xs text-muted-foreground">{t('dueDate')}: {form.dueDate}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenForm(form.id)}
              >
                <ArrowRightIcon className="h-4 w-4 mr-1" />
                {t('continue')}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingFormsList;
