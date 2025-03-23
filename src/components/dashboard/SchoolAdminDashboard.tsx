import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageSafe } from '@/context/LanguageContext';
import NotificationsCard from './NotificationsCard';
import FormStatusSection from './school-admin/FormStatusSection';
import FormTabs from './school-admin/FormTabs';
import { Notification } from './NotificationsCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DataEntryProgress from '../dataEntry/DataEntryProgress';
import { CalendarClock, Clock } from 'lucide-react';
import { Form } from '@/types/form';

// Mocklar üçün dataları təkmilləşdirək
const recentForms: Form[] = [
  { 
    id: 'form1', 
    title: 'Şagird kontingenti', 
    category: 'Əsas məlumatlar', 
    status: 'pending', 
    completionPercentage: 80, 
    deadline: '2023-06-20' 
  },
  { 
    id: 'form2', 
    title: 'Müəllim kadrları', 
    category: 'Əsas məlumatlar', 
    status: 'approved', 
    completionPercentage: 100, 
    deadline: '2023-06-15' 
  },
  { 
    id: 'form3', 
    title: 'Maddi-texniki baza', 
    category: 'İnfrastruktur', 
    status: 'rejected', 
    completionPercentage: 75, 
    deadline: '2023-06-18' 
  },
  { 
    id: 'form4', 
    title: 'Təlim nəticələri', 
    category: 'Akademik göstəricilər', 
    status: 'draft', 
    completionPercentage: 0, 
    deadline: '2023-06-25' 
  }
];

// Yaxınlaşan son tarixləri əlavə edək
const upcomingDeadlines = [
  {
    id: 'dl1',
    title: 'Şagird kontingenti',
    category: 'Əsas məlumatlar',
    deadline: '2023-06-20',
    daysLeft: 3,
    status: 'inProgress' as const
  },
  {
    id: 'dl2',
    title: 'Təlim nəticələri',
    category: 'Akademik göstəricilər',
    deadline: '2023-06-25',
    daysLeft: 8,
    status: 'notStarted' as const
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
    notifications: Notification[];
    categories?: number;
    totalForms?: number;
    completedForms?: number;
    pendingForms?: number;
    rejectedForms?: number;
    dueDates?: Array<{
      category: string;
      date: string;
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
  const [overallProgress, setOverallProgress] = useState(data.completionRate || 0);
  
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
  
  const handleNavigateToDataEntry = () => {
    if (navigateToDataEntry) {
      navigateToDataEntry();
    } else {
      navigate('/data-entry');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Ümumi tamamlanma faizini göstərən proqres */}
      <DataEntryProgress 
        percentage={data.completionRate} 
        completed={data.completedForms || 0} 
        total={data.totalForms || 0} 
      />
      
      {/* Form statusları bölməsi */}
      <FormStatusSection 
        forms={data.forms} 
        navigateToDataEntry={handleNavigateToDataEntry} 
      />
      
      {/* Formaların tablarla göstərilməsi */}
      <FormTabs 
        recentForms={recentForms} 
        handleFormClick={handleFormItemClick} 
      />
      
      {/* Yaxınlaşan son tarixlərin göstərilməsi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CalendarClock className="h-5 w-5 mr-2 text-amber-500" />
            {t('upcomingDeadlines')}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateToDataEntry}
          >
            {t('viewAll')}
          </Button>
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
