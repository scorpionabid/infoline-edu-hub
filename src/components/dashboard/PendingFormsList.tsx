
import React from 'react';
import { FormItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface PendingFormsListProps {
  forms: FormItem[];
  onViewForm?: (id: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  }
};

const PendingFormsList: React.FC<PendingFormsListProps> = ({ forms, onViewForm }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {forms.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          {t('noPendingForms')}
        </div>
      ) : (
        forms.map((form) => (
          <div key={form.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <div className="font-medium">{form.title}</div>
              <div className="text-sm text-muted-foreground">{form.categoryName || form.category}</div>
              {form.dueDate && (
                <div className="text-xs text-muted-foreground mt-1">
                  {t('dueDate')}: {form.dueDate}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusVariant(form.status)}>
                {form.status}
              </Badge>
              {onViewForm && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewForm(form.id)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {t('view')}
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PendingFormsList;
