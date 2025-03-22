
import React from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, FileClock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import StatsCard from './StatsCard';
import CompletionRateCard from './CompletionRateCard';
import NotificationsCard from './NotificationsCard';
import { Notification } from './NotificationsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SchoolAdminDashboardProps {
  data: {
    forms: {
      pending: number;
      approved: number;
      rejected: number;
      dueSoon: number;
      overdue: number;
    };
    completionRate: number;
    notifications: Notification[];
  };
}

// Demo üçün aktiv formlar
const activeForms = [
  {
    id: 'form1',
    title: 'Müəllim statistikası',
    dueDate: new Date(Date.now() + 86400000 * 3), // 3 gün sonra
    completionStatus: '75%'
  },
  {
    id: 'form2',
    title: 'Şagird davamiyyəti',
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 gün sonra
    completionStatus: '40%'
  },
  {
    id: 'form3',
    title: 'Məktəb infrastrukturu',
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 gün sonra
    completionStatus: '10%'
  }
];

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  
  const handleContinueForm = (formId: string, formTitle: string) => {
    toast.info(t('formContinue'), {
      description: `${formTitle} formasını doldurmağa davam edirsiniz.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatsCard 
          title={t('pendingForms')}
          value={data.forms.pending}
          icon={<FileText className="h-5 w-5 text-amber-500" />}
          color="amber"
        />
        <StatsCard 
          title={t('approvedForms')}
          value={data.forms.approved}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
        <StatsCard 
          title={t('rejectedForms')}
          value={data.forms.rejected}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color="red"
        />
        <StatsCard 
          title={t('dueSoon')}
          value={data.forms.dueSoon}
          icon={<FileClock className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <StatsCard 
          title={t('overdue')}
          value={data.forms.overdue}
          icon={<AlertCircle className="h-5 w-5 text-red-500" />}
          color={data.forms.overdue > 0 ? "red" : "green"}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompletionRateCard 
          completionRate={data.completionRate} 
          description={t('schoolDataSubmissionRate')}
        />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('activeForms')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeForms.map((form) => (
              <div key={form.id} className="border rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium">{form.title}</h4>
                  <div className="text-sm text-muted-foreground">
                    {t('dueDate')}: {format(form.dueDate, 'dd.MM.yyyy')} | {t('completed')}: {form.completionStatus}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleContinueForm(form.id, form.title)}
                >
                  {t('continue')}
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="mx-auto">
              {t('viewAllForms')}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
