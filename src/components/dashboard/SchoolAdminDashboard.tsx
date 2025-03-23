
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationsCard from './NotificationsCard';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormStatusProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'pending' | 'approved' | 'rejected' | 'due' | 'overdue';
  onClick: () => void;
}

const FormStatus: React.FC<FormStatusProps> = ({ count, label, icon, variant, onClick }) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    approved: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    rejected: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    due: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    overdue: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-lg border transition-colors',
        variantStyles[variant]
      )}
    >
      <div className="text-3xl font-bold mb-1">{count}</div>
      <div className="flex items-center gap-1 text-sm">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
};

interface FormCardProps {
  id: string;
  title: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "empty";
  completionPercentage: number;
  deadline?: string;
  onClick: () => void;
}

const FormCard: React.FC<FormCardProps> = ({ 
  id, 
  title, 
  category, 
  status, 
  completionPercentage, 
  deadline,
  onClick 
}) => {
  const statusConfig = {
    pending: { 
      label: 'Gözləmədə', 
      icon: <Clock className="h-4 w-4" />, 
      variant: 'bg-amber-50 text-amber-700 border-amber-200' 
    },
    approved: { 
      label: 'Təsdiqlənib', 
      icon: <CheckCircle2 className="h-4 w-4" />, 
      variant: 'bg-green-50 text-green-700 border-green-200' 
    },
    rejected: { 
      label: 'Rədd edilib', 
      icon: <XCircle className="h-4 w-4" />, 
      variant: 'bg-red-50 text-red-700 border-red-200' 
    },
    empty: { 
      label: 'Boş', 
      icon: <AlertCircle className="h-4 w-4" />, 
      variant: 'bg-slate-50 text-slate-700 border-slate-200' 
    }
  };

  const isOverdue = deadline && new Date(deadline) < new Date();

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
          <Badge variant="outline" className={cn(statusConfig[status].variant)}>
            <span className="flex items-center gap-1">
              {statusConfig[status].icon}
              {statusConfig[status].label}
            </span>
          </Badge>
        </div>
        <CardDescription className="line-clamp-1">{category}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full", 
              completionPercentage === 100 
                ? "bg-green-500" 
                : completionPercentage > 0 
                  ? "bg-amber-500" 
                  : "bg-slate-300"
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>{completionPercentage}% tamamlanıb</span>
          {deadline && (
            <span className={cn("flex items-center gap-1", isOverdue ? "text-red-600" : "text-slate-600")}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? 'Gecikmiş' : new Date(deadline).toLocaleDateString('az-AZ')}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full h-8 justify-between p-2">
          <span>Məlumat daxil et</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Mock data for recent forms
const recentForms = [
  { 
    id: 'form1', 
    title: 'Şagird kontingenti', 
    category: 'Əsas məlumatlar', 
    status: 'pending' as const, 
    completionPercentage: 80, 
    deadline: '2023-06-20' 
  },
  { 
    id: 'form2', 
    title: 'Müəllim kadrları', 
    category: 'Əsas məlumatlar', 
    status: 'approved' as const, 
    completionPercentage: 100, 
    deadline: '2023-06-15' 
  },
  { 
    id: 'form3', 
    title: 'Maddi-texniki baza', 
    category: 'İnfrastruktur', 
    status: 'rejected' as const, 
    completionPercentage: 75, 
    deadline: '2023-06-18' 
  },
  { 
    id: 'form4', 
    title: 'Təlim nəticələri', 
    category: 'Akademik göstəricilər', 
    status: 'empty' as const, 
    completionPercentage: 0, 
    deadline: '2023-06-25' 
  }
];

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
    notifications: Array<{
      id: number;
      type: string;
      title: string;
      message: string;
      time: string;
    }>;
  };
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ data }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleFormClick = (formId: string) => {
    navigate('/data-entry');
  };
  
  const navigateToDataEntry = () => {
    navigate('/data-entry');
  };
  
  const totalForms = data.forms.pending + data.forms.approved + data.forms.rejected + data.forms.dueSoon + data.forms.overdue;
  
  return (
    <div className="space-y-6">
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
            count={data.forms.pending} 
            label={t('pendingForms')} 
            icon={<Clock className="h-4 w-4" />} 
            variant="pending"
            onClick={navigateToDataEntry}
          />
          <FormStatus 
            count={data.forms.approved} 
            label={t('approvedForms')} 
            icon={<CheckCircle2 className="h-4 w-4" />} 
            variant="approved"
            onClick={navigateToDataEntry}
          />
          <FormStatus 
            count={data.forms.rejected} 
            label={t('rejectedForms')} 
            icon={<XCircle className="h-4 w-4" />} 
            variant="rejected"
            onClick={navigateToDataEntry}
          />
          <FormStatus 
            count={data.forms.dueSoon} 
            label={t('dueSoon')} 
            icon={<AlertTriangle className="h-4 w-4" />} 
            variant="due"
            onClick={navigateToDataEntry}
          />
          <FormStatus 
            count={data.forms.overdue} 
            label={t('overdue')} 
            icon={<AlertCircle className="h-4 w-4" />} 
            variant="overdue"
            onClick={navigateToDataEntry}
          />
        </div>
      </section>
      
      <section>
        <Tabs defaultValue="recent">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('forms')}</h2>
            <TabsList>
              <TabsTrigger value="recent">{t('recentForms')}</TabsTrigger>
              <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
              <TabsTrigger value="urgent">{t('urgentForms')}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="recent" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentForms.map(form => (
                <FormCard 
                  key={form.id}
                  id={form.id}
                  title={form.title}
                  category={form.category}
                  status={form.status}
                  completionPercentage={form.completionPercentage}
                  deadline={form.deadline}
                  onClick={() => handleFormClick(form.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentForms
                .filter(form => form.status === 'pending')
                .map(form => (
                  <FormCard 
                    key={form.id}
                    id={form.id}
                    title={form.title}
                    category={form.category}
                    status={form.status}
                    completionPercentage={form.completionPercentage}
                    deadline={form.deadline}
                    onClick={() => handleFormClick(form.id)}
                  />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="urgent" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentForms
                .filter(form => {
                  const isOverdue = form.deadline && new Date(form.deadline) < new Date();
                  return isOverdue || form.status === 'rejected';
                })
                .map(form => (
                  <FormCard 
                    key={form.id}
                    id={form.id}
                    title={form.title}
                    category={form.category}
                    status={form.status}
                    completionPercentage={form.completionPercentage}
                    deadline={form.deadline}
                    onClick={() => handleFormClick(form.id)}
                  />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
