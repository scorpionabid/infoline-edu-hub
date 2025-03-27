
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageSafe } from '@/context/LanguageContext';
import NotificationsCard from './NotificationsCard';
import FormStatusSection from './school-admin/FormStatusSection';
import { Notification } from './NotificationsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DataEntryProgress from '../dataEntry/DataEntryProgress';
import { CalendarClock, Clock, FileText, PlusCircle } from 'lucide-react';
import { Form, FormStatus } from '@/types/form';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FormItem } from '@/hooks/useDashboardData';

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
    recentForms?: Array<{
      id: string;
      title: string;
      category: string;
      status: FormStatus;
      completionPercentage: number;
      deadline?: string;
    }>;
  };
  navigateToDataEntry?: () => void;
  handleFormClick?: (formId: string) => void;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  data,
  navigateToDataEntry,
  handleFormClick 
}) => {
  const { t } = useLanguageSafe();
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
        status: index % 2 === 0 ? 'inProgress' as const : 'notStarted' as const
      })).filter(item => item.daysLeft > 0).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3)
    : [];
  
  return (
    <div className="space-y-6">
      {/* Minimalist Form Status Bölməsi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t('forms')}</h3>
            <p className="text-sm text-muted-foreground">{t('formStatusDesc')}</p>
          </div>
          <Button onClick={() => navigate('/data-entry')} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            {t('addNewData')}
          </Button>
        </div>
        
        <FormStatusSection 
          forms={data.forms} 
          navigateToDataEntry={handleNavigateToDataEntry} 
          activeStatus={selectedStatus}
          compact
        />
      </div>
      
      {/* Ümumi tamamlanma faizini göstərən proqres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
        <DataEntryProgress 
          percentage={data.completionRate} 
          completed={data.completedForms || 0} 
          total={data.totalForms || 0} 
        />
      </div>
      
      {/* Formaların sadələşdirilmiş görünüşü */}
      <Card className="p-4 border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            <FileText className="h-5 w-5 inline mr-2 text-primary" />
            {t('recentForms')}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentForms.slice(0, 4).map(form => (
            <div
              key={form.id}
              className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleFormItemClick(form.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium line-clamp-1">{form.title}</h4>
                <Badge 
                  variant="outline" 
                  className={`${
                    form.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                    form.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    form.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    form.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                    form.status === 'due' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {form.status === 'approved' ? t('approved') :
                   form.status === 'rejected' ? t('rejected') :
                   form.status === 'pending' ? t('pending') :
                   form.status === 'overdue' ? t('overdue') :
                   form.status === 'due' ? t('due') : t('draft')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{form.category}</p>
              <div className="flex items-center justify-between">
                <div className="w-full max-w-24">
                  <Progress value={form.completionPercentage} className="h-1.5" />
                </div>
                <span className="text-xs ml-2">{form.completionPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/data-entry')}
          >
            {t('viewAllForms')}
          </Button>
        </div>
      </Card>
      
      {/* Yaxınlaşan son tarixlərin göstərilməsi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border">
        <div className="flex items-center mb-4">
          <CalendarClock className="h-5 w-5 mr-2 text-amber-500" />
          <h3 className="text-lg font-semibold">{t('upcomingDeadlines')}</h3>
        </div>
        
        <div className="space-y-3">
          {upcomingDeadlines.map(deadline => (
            <div 
              key={deadline.id}
              className="flex justify-between items-center p-3 rounded-md bg-amber-50 border border-amber-100 hover:bg-amber-100 cursor-pointer"
              onClick={() => navigate(`/data-entry?categoryId=${deadline.id}`)}
            >
              <div>
                <h4 className="font-medium">{deadline.title}</h4>
                <p className="text-sm text-muted-foreground">{deadline.category}</p>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-amber-600" />
                <span className="text-sm font-medium text-amber-600">
                  {deadline.daysLeft} {t('daysLeft')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bildirişlər kartı */}
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
