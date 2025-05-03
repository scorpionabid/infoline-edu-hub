
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, AlarmClock, Clock, CheckCircle, XCircle, FileText, ArrowRight } from 'lucide-react';
import { FormItem } from '@/types/dashboard';
import { FormStatus } from '@/types/form';

interface FormTabsProps {
  forms: FormItem[];
  onFormClick: (formId: string) => void;
}

export const FormTabs: React.FC<FormTabsProps> = ({
  forms,
  onFormClick
}) => {
  const [activeTab, setActiveTab] = React.useState<FormStatus>('all');
  
  const filteredForms = React.useMemo(() => {
    if (activeTab === 'all') return forms;
    return forms.filter(form => form.status === activeTab);
  }, [forms, activeTab]);
  
  const getIcon = (status: FormStatus, deadline?: string) => {
    // Təcili formaların ikonlarını əlavə et
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        return <AlarmClock className="h-5 w-5 text-red-500" />;
      }
      if (diffDays <= 3) {
        return <Clock className="h-5 w-5 text-yellow-500" />;
      }
    }
    
    // Status ikonları
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatus = (status: FormStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Təsdiqlənmiş', color: 'text-green-600' };
      case 'rejected':
        return { label: 'Rədd edilmiş', color: 'text-red-600' };
      case 'pending':
        return { label: 'Gözləmədə', color: 'text-yellow-600' };
      case 'dueSoon':
        return { label: 'Müddət bitir', color: 'text-orange-600' };
      case 'overdue':
        return { label: 'Müddəti keçmiş', color: 'text-red-600' };
      case 'draft':
        return { label: 'Qaralama', color: 'text-gray-600' };
      case 'incomplete':
        return { label: 'Tamamlanmayıb', color: 'text-blue-600' };
      default:
        return { label: 'Qaralama', color: 'text-gray-600' };
    }
  };
  
  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FormStatus)}>
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="all">Hamısı</TabsTrigger>
        <TabsTrigger value="draft">Qaralama</TabsTrigger>
        <TabsTrigger value="pending">Gözləmədə</TabsTrigger>
        <TabsTrigger value="approved">Təsdiqlənmiş</TabsTrigger>
        <TabsTrigger value="rejected">Rədd edilmiş</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab}>
        {filteredForms.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            Göstəriləcək forma yoxdur
          </div>
        ) : (
          <div className="space-y-2">
            {filteredForms.map((form) => (
              <div 
                key={form.id} 
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIcon(form.status, form.deadline)}
                    </div>
                    <div>
                      <h3 className="font-medium">{form.name}</h3>
                      <div className="flex gap-3 text-sm mt-1">
                        <span className={getStatus(form.status).color}>
                          {getStatus(form.status).label}
                        </span>
                        
                        {form.deadline && (
                          <span className="flex items-center text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 mr-1" />
                            Son tarix: {getFormattedDate(form.deadline)}
                          </span>
                        )}
                        
                        {form.submittedAt && (
                          <span className="text-muted-foreground">
                            Göndərilib: {getFormattedDate(form.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onFormClick(form.id)}
                  >
                    {form.status === 'approved' ? 'Bax' : 'Davam et'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
