
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Form, FormStatus } from '@/types/form';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, FilePlus } from 'lucide-react';

interface FormTabsProps {
  pendingForms: Form[];
  approvedForms: Form[];
  dueSoonForms: Form[];
  onViewForm: (formId: string) => void;
  onAddData: () => void;
}

const FormTabs: React.FC<FormTabsProps> = ({
  pendingForms,
  approvedForms,
  dueSoonForms,
  onViewForm,
  onAddData
}) => {
  const { t } = useLanguage();

  // Badge rəngi üçün funksiya
  const getStatusBadgeClass = (status: FormStatus) => {
    switch (status) {
      case FormStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case FormStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case FormStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case FormStatus.DUE_SOON:
        return 'bg-orange-100 text-orange-800';
      case FormStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Form siyahısı üçün komponent
  const FormList = ({ forms }: { forms: Form[] }) => (
    <div className="space-y-3 mt-4">
      {forms.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">{t('noForms')}</div>
      ) : (
        forms.map((form) => (
          <div key={form.id} className="border rounded-md p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{form.title}</div>
              <div className="text-sm text-muted-foreground">{form.description}</div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusBadgeClass(form.status)}>
                {t(form.status.toString())}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => onViewForm(form.id)}>
                {t('view')}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Tabs defaultValue="pending" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            {t('pending')}
            {pendingForms.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                {pendingForms.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
          <TabsTrigger value="dueSoon">
            {t('dueSoon')}
            {dueSoonForms.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                {dueSoonForms.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('viewReports')}
          </Button>
          <Button size="sm" onClick={onAddData}>
            <FilePlus className="h-4 w-4 mr-2" />
            {t('addData')}
          </Button>
        </div>
      </div>
      
      <TabsContent value="pending">
        <FormList forms={pendingForms} />
      </TabsContent>
      
      <TabsContent value="approved">
        <FormList forms={approvedForms} />
      </TabsContent>
      
      <TabsContent value="dueSoon">
        <FormList forms={dueSoonForms} />
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
