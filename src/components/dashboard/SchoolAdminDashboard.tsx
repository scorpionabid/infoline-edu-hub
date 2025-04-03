
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import NotificationsCard from './NotificationsCard';
import FormStatusSection from './school-admin/FormStatusSection';
import { Notification } from '@/types/notification';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DataEntryProgress from '../dataEntry/DataEntryProgress';
import { CalendarClock, Clock, FileText, PlusCircle } from 'lucide-react';
import { Form, FormStatus } from '@/types/form';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FormItem } from '@/types/form';

interface SchoolAdminDashboardProps {
  data: {
    schoolName: string;
    sectorName: string;
    regionName: string;
    forms: {
      pending: number;
      approved: number;
      rejected: number;
      dueSoon: number;
      overdue: number;
    };
    completionRate: number;
    notifications: Notification[];
    categories?: number;
    totalForms?: number;
    completedForms?: number;
    pendingForms: FormItem[]; 
    rejectedForms?: number;
    dueDates?: Array<{
      category: string;
      date: string;
    }>;
    recentForms?: Array<FormItem>;
  };
  navigateToDataEntry?: () => void;
  handleFormClick?: (formId: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  data,
  navigateToDataEntry,
  handleFormClick 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Son dəfə işlənmiş kateqoriya bildirişi üçün effekt
  useEffect(() => {
    const lastCategory = localStorage.getItem('lastEditedCategory');
    if (lastCategory) {
      toast.info(t('lastEditedCategory'), {
        description: `"${lastCategory}" - ${t('continueEditing')}`,
        action: {
          label: t('continue'),
          onClick: () => navigate(`/data-entry?categoryId=${lastCategory}`),
        },
      });
      // Bildirişi bir dəfə göstərmək üçün localStorage təmizləyək
      localStorage.removeItem('lastEditedCategory');
    }
  }, [navigate, t]);
  
  const handleFormItemClick = (formId: string) => {
    if (handleFormClick) {
      handleFormClick(formId);
    } else {
      navigate(`/data-entry?categoryId=${formId}`);
    }
  };
  
  const handleNavigateToDataEntry = (status: string | null = null) => {
    setSelectedStatus(status);
    if (navigateToDataEntry) {
      navigateToDataEntry();
    } else {
      if (status) {
        navigate(`/data-entry?status=${status}`);
      } else {
        navigate('/data-entry');
      }
    }
  };

  // İndi mockCategories-dən gələn dataları istifadə edirik
  const recentForms = data.recentForms || [];
  
  // Son tarixlərə görə listi hazırlayırıq
  const upcomingDeadlines = data.dueDates 
    ? data.dueDates.map((item, index) => ({
        id: `dl${index + 1}`,
        title: item.category,
        category: item.category,
        deadline: item.date,
        daysLeft: Math.floor((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        status: index % 2 === 0 ? 'inProgress' as FormStatus : 'pending' as FormStatus
      })).filter(item => item.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3)
    : [];
  
  return (
    <div className="space-y-6">
      {/* Dashboard intro */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.schoolName}</h1>
          <p className="text-muted-foreground">
            {data.sectorName}, {data.regionName}
          </p>
        </div>
        <Button onClick={() => handleNavigateToDataEntry()} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('newEntry')}
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('pendingForms')}</p>
              <h2 className="text-3xl font-bold">{data.forms.pending}</h2>
            </div>
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <Progress value={data.forms.pending} max={(data.totalForms || 0) + 1} className="h-1 mt-3" />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('overdueEntries')}</p>
              <h2 className="text-3xl font-bold">{data.forms.overdue}</h2>
            </div>
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <Progress value={data.forms.overdue} max={(data.totalForms || 0) + 1} className="h-1 mt-3 bg-red-200" />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('dueSoon')}</p>
              <h2 className="text-3xl font-bold">{data.forms.dueSoon}</h2>
            </div>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <CalendarClock className="h-6 w-6" />
            </div>
          </div>
          <Progress value={data.forms.dueSoon} max={(data.totalForms || 0) + 1} className="h-1 mt-3 bg-blue-200" />
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('completionRate')}</p>
              <h2 className="text-3xl font-bold">{data.completionRate}%</h2>
            </div>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <DataEntryProgress percentage={data.completionRate} size={32} strokeWidth={4} />
            </div>
          </div>
          <Progress value={data.completionRate} max={100} className="h-1 mt-3" />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormStatusSection 
          pendingCount={data.forms.pending}
          approvedCount={data.forms.approved}
          rejectedCount={data.forms.rejected}
          overdueCount={data.forms.overdue}
          dueSoonCount={data.forms.dueSoon}
          onNavigate={handleNavigateToDataEntry}
        />
        
        <NotificationsCard notifications={data.notifications || []} />
      </div>
      
      {/* Recent & pending forms */}
      {data.pendingForms && data.pendingForms.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">{t('pendingForms')}</h3>
          <div className="space-y-4">
            {data.pendingForms.slice(0, 5).map((form) => (
              <div 
                key={form.id}
                className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleFormItemClick(form.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{form.title}</h4>
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant="outline" 
                      className={
                        form.status === 'pending' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                        form.status === 'overdue' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                        'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }
                    >
                      {form.status === 'pending' ? t('pending') : 
                       form.status === 'overdue' ? t('overdue') :
                       form.status === 'rejected' ? t('rejected') :
                       form.status === 'approved' ? t('approved') : 
                       t('unknown')}
                    </Badge>
                    <Progress 
                      value={form.completionPercentage} 
                      max={100} 
                      className="h-2 w-24 ml-3" 
                    />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {form.completionPercentage}%
                    </span>
                  </div>
                </div>
                {form.deadline && (
                  <div className="text-sm text-muted-foreground">
                    {new Date(form.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {data.pendingForms.length > 5 && (
            <div className="mt-4 text-center">
              <Button 
                variant="link"
                onClick={() => handleNavigateToDataEntry('pending')}
              >
                {t('viewAllPendingForms')} ({data.pendingForms.length})
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SchoolAdminDashboard;
