
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import NotificationsCard from './NotificationsCard';
import FormStatusSection from './school-admin/FormStatusSection';
import FormTabs from './school-admin/FormTabs';

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
  
  return (
    <div className="space-y-6">
      <FormStatusSection 
        forms={data.forms} 
        navigateToDataEntry={navigateToDataEntry} 
      />
      
      <FormTabs 
        recentForms={recentForms} 
        handleFormClick={handleFormClick} 
      />
      
      <NotificationsCard notifications={data.notifications} />
    </div>
  );
};

export default SchoolAdminDashboard;
