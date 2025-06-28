import React from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  FileText,
  TrendingUp,
  Calendar,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { FilesCard } from "./FilesCard";
import { LinksCard } from "./LinksCard";
import NotificationsCard from "@/components/dashboard/common/NotificationsCard";
import EnhancedCard from "@/components/ui/enhanced-card";
import { EnhancedStatsGrid } from "../enhanced/EnhancedStatsGrid";
import { TranslationWrapper } from "@/components/translation/TranslationWrapper";

import ColumnStatusGrid from './ColumnStatusGrid';
import { useSchoolDashboardData } from '@/hooks/dashboard/useSchoolDashboardData';
import { toast } from "sonner";

interface SchoolAdminDashboardProps {
  dashboardData?: any; // Backward compatibility için saxlanıldı
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  dashboardData = {}
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Yeni school-specific dashboard data hook-unu istifadə edirik
  const { 
    data: schoolData, 
    loading, 
    error,
    refetch, 
    isReady, 
    hasData, 
    isEmpty 
  } = useSchoolDashboardData({ 
    autoRefresh: true, 
    refreshInterval: 30000 
  });

  // Category click handler - DataEntry səhifəsinə yönləndirir
  const handleCategoryClick = (categoryId: string) => {
    console.log('Navigating to data entry for category:', categoryId);
    navigate('/school-data-entry', { 
      state: { 
        mode: 'data-entry', 
        categoryId,
        returnUrl: '/dashboard' 
      } 
    });
  };

  // Column click handler - DataEntry səhifəsinə fokuslanmış sütunla yönləndirir
  const handleColumnClick = (categoryId: string, columnId: string) => {
    console.log('Navigating to data entry for column:', categoryId, columnId);
    navigate('/school-data-entry', { 
      state: { 
        mode: 'data-entry', 
        categoryId,
        focusColumnId: columnId,
        returnUrl: '/dashboard' 
      } 
    });
  };

  // Quick actions handlers
  const handleRefreshData = () => {
    refetch();
    toast.success("Məlumatlar yeniləndi");
  };

  // Stats data real məlumatlardan hazırlanır
  console.log('Real school dashboard data:', schoolData);
  
  const statsData = [
    {
      id: 'total-categories',
      title: 'Ümumi Kateqoriyalar',
      value: schoolData?.totalCategories || 0,
      description: 'Doldurulması tələb olunan kateqoriyalar',
      icon: FileText,
      variant: 'default' as const
    },
    {
      id: 'completed-categories',
      title: 'Tamamlanmış',
      value: schoolData?.completedCategories || 0,
      description: 'Tam doldurulmuş kateqoriyalar',
      icon: CheckCircle,
      variant: 'success' as const,
      trend: schoolData?.totalCategories ? {
        value: Math.round((schoolData.completedCategories / schoolData.totalCategories) * 100),
        isPositive: true
      } : undefined
    },
    {
      id: 'total-columns',
      title: 'Ümumi Sahələr',
      value: schoolData?.totalColumns || 0,
      description: 'Doldurulması tələb olunan sahələr',
      icon: Clock,
      variant: 'primary' as const
    },
    {
      id: 'overall-progress',
      title: 'Ümumi Tərəqqi',
      value: `${schoolData?.overallProgress || 0}%`,
      description: 'Ümumi doldurulma faizi',
      icon: TrendingUp,
      variant: 'primary' as const,
      trend: {
        value: schoolData?.overallProgress || 0,
        isPositive: (schoolData?.overallProgress || 0) > 50
      }
    }
  ];

  // Error state
  if (error) {
    return (
      <TranslationWrapper minimal>
        <div className="space-y-6">
          <EnhancedCard className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Məlumatlar yüklənərkən xəta baş verdi
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Naməlum xəta baş verdi'}
            </p>
            <Button onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenidən Cəhd Et
            </Button>
          </EnhancedCard>
        </div>
      </TranslationWrapper>
    );
  }

  // Loading state
  if (loading && !schoolData) {
    return (
      <TranslationWrapper minimal>
        <div className="space-y-6 animate-fade-in-up">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <EnhancedCard key={`loading-stat-${i}`} className="h-24">
                <div className="flex items-center justify-between h-full">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </EnhancedCard>
            ))}
          </div>
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Dashboard məlumatları yüklənir...</p>
          </div>
        </div>
      </TranslationWrapper>
    );
  }

  return (
    <TranslationWrapper minimal>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Məktəb Dashboard</h1>
            <p className="text-muted-foreground">
              Məlumat doldurma vəziyyətinizi izləyin və idarə edin
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenilə
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid - Real data ilə */}
        <EnhancedStatsGrid stats={statsData} />

        {/* Column Status Grid Section - Real data ilə */}
        {isReady && hasData && (schoolData?.columnStatuses?.length || 0) > 0 && (
          <ColumnStatusGrid
            columns={schoolData.columnStatuses || []}
            onColumnClick={handleColumnClick}
            groupBy="category"
            showFilter={true}
            loading={loading}
          />
        )}
        
        {/* Empty State */}
        {isReady && isEmpty && (
          <EnhancedCard className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Hələ ki, kateqoriya tapılmadı
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sistem administratorunuz tərəfindən kateqoriyalar əlavə ediləndə burada görünəcək.
            </p>
            <Button onClick={handleRefreshData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Yenidən Yüklə
            </Button>
          </EnhancedCard>
        )}

        {/* Additional Information - Real data varsa */}
        {schoolData && hasData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Form Status Summary */}
            <EnhancedCard>
              <div className="p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Form Statusları</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gözləyən:</span>
                    <span className="font-medium text-yellow-600">{schoolData.pendingForms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Təsdiqlənmiş:</span>
                    <span className="font-medium text-green-600">{schoolData.approvedForms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rədd edilmiş:</span>
                    <span className="font-medium text-red-600">{schoolData.rejectedForms}</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Files and Links Section */}
            <FilesCard />
            
            {/* Notifications Section */}
            <NotificationsCard maxNotifications={5} />
          </div>
        )}
        
        {/* Additional Tools Section */}
        <div className="grid gap-6 md:grid-cols-1">
          <LinksCard />
        </div>
      </div>
    </TranslationWrapper>
  );
};

export default SchoolAdminDashboard;
