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
        // mockCategories üzərindən kateqoriya məlumatlarını əldə edirik
        const categoryCount = mockCategories.length;
        const totalFormsCount = mockCategories.reduce((total, cat) => total + cat.columns.length, 0);
        
        // Təsdiqlənmiş, gözləmədə və rədd edilmiş formların sayını hesablayırıq
        const completedFormsCount = Math.floor(totalFormsCount * 0.45); // 45% tamamlanmış
        const pendingFormsCount = Math.floor(totalFormsCount * 0.35);  // 35% gözləmədə
        const rejectedFormsCount = Math.floor(totalFormsCount * 0.20); // 20% rədd edilmiş
        
        // Son tarixlər üçün kateqoriya məlumatlarından istifadə edirik
        const dueDates = mockCategories
          .filter(cat => cat.deadline)
          .map(cat => ({
            category: cat.name,
            date: cat.deadline || new Date().toISOString()
          }));
        
        // Son formalar üçün MockCategories-dəki mövcud kateqoriyalardan və onların sütunlarından istifadə edirik
        const recentForms = mockCategories.flatMap(category => 
          category.columns.slice(0, 2).map((column, idx) => ({
            id: `${category.id}-${column.id}`,
            title: column.name,
            category: category.name,
            status: idx % 4 === 0 ? "pending" : 
                   idx % 4 === 1 ? "approved" : 
                   idx % 4 === 2 ? "rejected" : "draft",
            completionPercentage: idx % 4 === 1 ? 100 : Math.floor(Math.random() * 80) + 20,
            deadline: category.deadline
          }))
        ).slice(0, 8);
        
        return {
          completionRate: 57,
          forms: {
            pending: pendingFormsCount,
            approved: completedFormsCount,
            rejected: rejectedFormsCount,
            dueSoon: 3,
            overdue: 1
          },
          notifications: [
            { id: 1, type: "warning", title: "Son tarix yaxınlaşır", message: "Tədris məlumatları üçün son tarix yaxınlaşır", time: "2 saat əvvəl" },
            { id: 2, type: "error", title: "Məlumatlar rədd edildi", message: "Müəllim məlumatları düzəlişlər tələb edir", time: "dünən" },
            { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "İnfrastruktur məlumatları təsdiqləndi", time: "2 gün əvvəl" },
          ],
          categories: categoryCount,
          totalForms: totalFormsCount, 
          completedForms: completedFormsCount,
          pendingForms: pendingFormsCount,
          rejectedForms: rejectedFormsCount,
          dueDates: dueDates,
          recentForms: recentForms
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
