
import React, { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import RegionAdminDashboard from '@/components/dashboard/RegionAdminDashboard';
import SectorAdminDashboard from '@/components/dashboard/SectorAdminDashboard';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/components/dashboard/NotificationsCard';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// Mock data
import { mockSchools } from '@/data/schoolsData';
import { mockCategories } from '@/data/mockCategories';

// İnterfeysi əlavə edək
interface SchoolAdminDashboardType {
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
  recentForms?: Array<{
    id: string;
    title: string;
    category: string;
    status: "pending" | "approved" | "rejected" | "draft" | "overdue" | "due";
    completionPercentage: number;
    deadline?: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  // Səhifəni yükləmə simulyasiyası
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Data entry səhifəsinə keçid
  const navigateToDataEntry = () => {
    navigate('/data-entry');
    toast.success(t('navigatingToDataEntry'), {
      description: t('navigatingToDataEntryDesc')
    });
  };
  
  // Generate mock data based on user's role
  const getMockDashboardData = () => {
    switch (user?.role) {
      case 'superadmin':
        return {
          regions: 10,
          sectors: 45,
          schools: 596,
          users: 684,
          completionRate: 78,
          pendingApprovals: 23,
          pendingSchools: 65,
          approvedSchools: 452,
          rejectedSchools: 12,
          statusData: {
            completed: 452,
            pending: 65,
            rejected: 12,
            notStarted: 67,
          },
          notifications: [
            { id: 1, type: "info", title: "Yeni hesabatlar", message: "24 yeni hesabat əlavə edilib", time: "2 saat əvvəl" },
            { id: 2, type: "warning", title: "Son tarix yaxınlaşır", message: "Müəllim məlumatları üçün son tarix yaxınlaşır", time: "5 saat əvvəl" },
            { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "Məktəb məlumatları 3 region üçün təsdiqləndi", time: "dünən" },
          ],
          activityData: [
            { id: "a1", action: "İstifadəçi yaradıldı", actor: "Əhməd Məmmədov", target: "Leyla Əliyeva (Region 4 Admin)", time: "1 saat əvvəl" },
            { id: "a2", action: "Kateqoriya yaradıldı", actor: "Cavid Hüseynov", target: "İnfrastruktur məlumatları", time: "3 saat əvvəl" },
            { id: "a3", action: "Məlumatlar təsdiqləndi", actor: "Samirə Qasımova", target: "Bakı şəhəri, 28 məktəb", time: "4 saat əvvəl" },
            { id: "a4", action: "Hesabat yaradıldı", actor: "Orxan Nəsibov", target: "Bölgə üzrə şagird sayı hesabatı", time: "dünən" },
          ]
        };
      case 'regionadmin':
        // For Region Admin, include category completion and sector data
        return {
          regions: 1, // Region admini bir region üçün məsuldur, buna görə də regions: 1 əlavə edirik
          sectors: 12,
          schools: 167,
          users: 185,
          completionRate: 72,
          pendingApprovals: 18,
          pendingSchools: 28,
          approvedSchools: 124,
          rejectedSchools: 8,
          notifications: [
            { id: 1, type: "info", title: "Yeni məlumatlar", message: "15 məktəb üçün yeni məlumatlar daxil edilib", time: "3 saat əvvəl" },
            { id: 2, type: "warning", title: "Təsdiq gözləyən məlumatlar", message: "8 məktəb üçün məlumatlar təsdiqlənməlidir", time: "5 saat əvvəl" },
            { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "12 məktəb üçün məlumatlar təsdiqləndi", time: "dünən" },
          ],
          // Category completion data
          categories: [
            { name: "Tədris məlumatları", completionRate: 82, color: "bg-blue-500" },
            { name: "Müəllim məlumatları", completionRate: 67, color: "bg-green-500" },
            { name: "İnfrastruktur məlumatları", completionRate: 45, color: "bg-amber-500" },
            { name: "Maliyyə məlumatları", completionRate: 34, color: "bg-purple-500" },
          ],
          // Sector completion data
          sectorCompletions: [
            { name: "Sektor 1", completionRate: 92 },
            { name: "Sektor 2", completionRate: 78 },
            { name: "Sektor 3", completionRate: 63 },
            { name: "Sektor 4", completionRate: 45 },
            { name: "Sektor 5", completionRate: 29 },
          ],
          activityData: [
            { id: "a1", action: "İstifadəçi yaradıldı", actor: "Siz", target: "Ramin Rəsulov (Sektor 3 Admin)", time: "2 saat əvvəl" },
            { id: "a2", action: "Məlumatlar təsdiqləndi", actor: "Siz", target: "Sektor 2, 8 məktəb", time: "5 saat əvvəl" },
            { id: "a3", action: "Hesabat yaradıldı", actor: "Siz", target: "Region üzrə şagird sayı hesabatı", time: "dünən" },
          ]
        };
      case 'sectoradmin':
        return {
          schools: 34,
          completionRate: 68,
          pendingApprovals: 12,
          pendingSchools: 15,
          approvedSchools: 16,
          rejectedSchools: 3,
          notifications: [
            { id: 1, type: "info", title: "Yeni məlumatlar", message: "5 məktəb üçün yeni məlumatlar daxil edilib", time: "1 saat əvvəl" },
            { id: 2, type: "warning", title: "Təsdiq gözləyən məlumatlar", message: "12 məktəb üçün məlumatlar təsdiqlənməlidir", time: "3 saat əvvəl" },
            { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "4 məktəb üçün məlumatlar təsdiqləndi", time: "dünən" },
          ],
          // Sektor admin üçün məktəb məlumatları
          schoolsData: [
            { id: 1, name: "28 nömrəli məktəb", status: "pending", completionRate: 75 },
            { id: 2, name: "42 nömrəli məktəb", status: "approved", completionRate: 100 },
            { id: 3, name: "12 nömrəli məktəb", status: "pending", completionRate: 60 },
            { id: 4, name: "117 nömrəli məktəb", status: "rejected", completionRate: 45 },
            { id: 5, name: "45 nömrəli məktəb", status: "pending", completionRate: 30 },
          ],
          // Sektor admin üçün kateqoriya tamamlanma məlumatları
          categoriesData: [
            { name: "Tədris məlumatları", completionRate: 72, color: "bg-blue-500" },
            { name: "Müəllim məlumatları", completionRate: 58, color: "bg-green-500" },
            { name: "İnfrastruktur məlumatları", completionRate: 43, color: "bg-amber-500" },
            { name: "Maliyyə məlumatları", completionRate: 29, color: "bg-purple-500" },
          ],
          // Sektor admin üçün təsdiq gözləyən məlumatlar
          pendingApprovalsData: [
            { id: 1, schoolName: "28 nömrəli məktəb", category: "Tədris məlumatları", submitted: "2023-10-12", formCount: 3 },
            { id: 2, schoolName: "12 nömrəli məktəb", category: "Müəllim məlumatları", submitted: "2023-10-14", formCount: 2 },
            { id: 3, schoolName: "45 nömrəli məktəb", category: "İnfrastruktur məlumatları", submitted: "2023-10-15", formCount: 1 },
          ],
          // Sektor admin üçün aktivlik məlumatları
          activityData: [
            { id: "a1", action: "Məlumatlar təsdiqləndi", actor: "Siz", target: "28 nömrəli məktəb", time: "2 saat əvvəl" },
            { id: "a2", action: "Məlumatlar rədd edildi", actor: "Siz", target: "45 nömrəli məktəb", time: "4 saat əvvəl" },
            { id: "a3", action: "Bildiriş göndərildi", actor: "Siz", target: "Bütün məktəblərə", time: "dünən" },
          ]
        };
      case 'schooladmin':
        return {
          completionRate: 57,
          forms: {
            pending: 4,
            approved: 8,
            rejected: 2,
            dueSoon: 3,
            overdue: 1
          },
          notifications: [
            { id: 1, type: "warning", title: "Son tarix yaxınlaşır", message: "Tədris məlumatları üçün son tarix yaxınlaşır", time: "2 saat əvvəl" },
            { id: 2, type: "error", title: "Məlumatlar rədd edildi", message: "Müəllim məlumatları düzəlişlər tələb edir", time: "dünən" },
            { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "İnfrastruktur məlumatları təsdiqləndi", time: "2 gün əvvəl" },
          ],
          categories: 5,
          totalForms: 18, 
          completedForms: 8,
          pendingForms: 4,
          rejectedForms: 2,
          dueDates: [
            { category: "Tədris məlumatları", date: "2023-10-15" },
            { category: "Müəllim məlumatları", date: "2023-10-20" },
            { category: "İnfrastruktur məlumatları", date: "2023-11-10" },
          ],
          // Məktəb admini üçün form məlumatları
          recentForms: [
            { 
              id: "form1", 
              title: "Tədris planı", 
              category: "Tədris məlumatları", 
              status: "pending", 
              completionPercentage: 85, 
              deadline: "2023-10-20" 
            },
            { 
              id: "form2", 
              title: "Müəllim ştatları", 
              category: "Müəllim məlumatları", 
              status: "approved", 
              completionPercentage: 100, 
              deadline: "2023-10-15" 
            },
            { 
              id: "form3", 
              title: "Şagird nailiyyətləri", 
              category: "Tədris məlumatları", 
              status: "rejected", 
              completionPercentage: 60, 
              deadline: "2023-10-25" 
            },
            { 
              id: "form4", 
              title: "Texniki baza", 
              category: "İnfrastruktur məlumatları", 
              status: "approved", 
              completionPercentage: 100, 
              deadline: "2023-11-05" 
            },
            { 
              id: "form5", 
              title: "Təhsil keyfiyyəti", 
              category: "Tədris məlumatları", 
              status: "draft", 
              completionPercentage: 40, 
              deadline: "2023-10-30" 
            },
            { 
              id: "form6", 
              title: "Maliyyə hesabatı", 
              category: "Maliyyə məlumatları", 
              status: "pending", 
              completionPercentage: 75, 
              deadline: "2023-11-15" 
            },
            { 
              id: "form7", 
              title: "Sinif otaqları", 
              category: "İnfrastruktur məlumatları", 
              status: "overdue", 
              completionPercentage: 30, 
              deadline: "2023-10-10" 
            },
            { 
              id: "form8", 
              title: "İnkişaf planı", 
              category: "İdarəetmə", 
              status: "due", 
              completionPercentage: 100, 
              deadline: "2023-10-05" 
            }
          ]
        };
      default:
        return {};
    }
  };
  
  const dashboardData = getMockDashboardData();
  
  // Mövcud komponentləri yeni DashboardTabs komponentinə uyğunlaşdırmaq üçün lazım olan məlumatlar
  const activityData = [
    { name: 'Yan', value: 20 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'İyn', value: 43 },
    { name: 'İyl', value: 50 },
  ];
  
  const regionSchoolsData = [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
  
  const categoryCompletionData = [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
  ];
  
  // Form-a keçid funksiyası - Data entry səhifəsinə yönləndirir və form ID-sini ötürür
  const handleFormClick = (formId: string) => {
    navigate(`/data-entry?formId=${formId}`);
    toast.info(t('openingForm'), {
      description: `${t('formId')}: ${formId}`
    });
  };
  
  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case 'superadmin': {
        const superAdminData = dashboardData as {
          regions: number;
          sectors: number;
          schools: number;
          users: number;
          completionRate: number;
          pendingApprovals: number;
          notifications: Notification[];
          activityData?: {
            id: string;
            action: string;
            actor: string;
            target: string;
            time: string;
          }[];
          pendingSchools?: number;
          approvedSchools?: number;
          rejectedSchools?: number;
          statusData?: {
            completed: number;
            pending: number;
            rejected: number;
            notStarted: number;
          };
        };
        return <SuperAdminDashboard data={superAdminData} />;
      }
      case 'regionadmin': {
        const regionAdminData = dashboardData as {
          sectors: number;
          schools: number;
          users: number;
          completionRate: number;
          pendingApprovals: number;
          pendingSchools: number;
          approvedSchools: number;
          rejectedSchools: number;
          notifications: Notification[];
          categories: {
            name: string;
            completionRate: number;
            color: string;
          }[];
          sectorCompletions: {
            name: string;
            completionRate: number;
          }[];
        };
        return <RegionAdminDashboard data={regionAdminData} />;
      }
      case 'sectoradmin': {
        const sectorAdminData = dashboardData as {
          schools: number;
          completionRate: number;
          pendingApprovals: number;
          pendingSchools: number;
          approvedSchools: number;
          rejectedSchools: number;
          notifications: Notification[];
        };
        return <SectorAdminDashboard data={sectorAdminData} />;
      }
      case 'schooladmin': {
        const schoolAdminData = dashboardData as SchoolAdminDashboardType;
        return (
          <SchoolAdminDashboard 
            data={schoolAdminData}
            navigateToDataEntry={navigateToDataEntry}
            handleFormClick={handleFormClick}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <DashboardHeader />
        
        {user?.role === 'superadmin' && (
          <DashboardTabs 
            activityData={activityData}
            regionSchoolsData={regionSchoolsData}
            categoryCompletionData={categoryCompletionData}
          />
        )}
        
        {renderDashboard()}
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
