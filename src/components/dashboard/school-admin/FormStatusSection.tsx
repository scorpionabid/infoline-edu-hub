
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import FormStatus from './FormStatus';

interface FormStatusSectionProps {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  navigateToDataEntry: () => void;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({ forms, navigateToDataEntry }) => {
  const { t } = useLanguage();
  
  const totalForms = forms.pending + forms.approved + forms.rejected + forms.dueSoon + forms.overdue;
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('formStatus')}</h2>
        <Button onClick={navigateToDataEntry} className="gap-1">
          <FileText className="h-4 w-4" />
          <span>{t('enterData')}</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        <FormStatus 
          count={totalForms} 
          label={t('allForms')} 
          icon={<FileText className="h-4 w-4" />} 
          variant="default"
          onClick={navigateToDataEntry}
        />
        <FormStatus 
          count={forms.pending} 
          label={t('pendingForms')} 
          icon={<Clock className="h-4 w-4" />} 
          variant="pending"
          onClick={navigateToDataEntry}
        />
        <FormStatus 
          count={forms.approved} 
          label={t('approvedForms')} 
          icon={<CheckCircle2 className="h-4 w-4" />} 
          variant="approved"
          onClick={navigateToDataEntry}
        />
        <FormStatus 
          count={forms.rejected} 
          label={t('rejectedForms')} 
          icon={<XCircle className="h-4 w-4" />} 
          variant="rejected"
          onClick={navigateToDataEntry}
        />
        <FormStatus 
          count={forms.dueSoon} 
          label={t('dueSoon')} 
          icon={<AlertTriangle className="h-4 w-4" />} 
          variant="due"
          onClick={navigateToDataEntry}
        />
        <FormStatus 
          count={forms.overdue} 
          label={t('overdue')} 
          icon={<AlertCircle className="h-4 w-4" />} 
          variant="overdue"
          onClick={navigateToDataEntry}
        />
      </div>
    </section>
  );
};

export default FormStatusSection;
