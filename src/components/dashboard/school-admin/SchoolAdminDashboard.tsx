
import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  FileText,
  TrendingUp,
  Calendar,
  Bell,
} from "lucide-react";
import { FilesCard } from "./FilesCard";
import { LinksCard } from "./LinksCard";
import FormStatusSection from "./FormStatusSection";
import { NotificationList } from "./NotificationList";
import NotificationCard from "@/components/dashboard/NotificationCard";
import EnhancedCard from "@/components/ui/enhanced-card";
import { EnhancedStatsGrid } from "../enhanced/EnhancedStatsGrid";
import { TranslationWrapper } from "@/components/translation/TranslationWrapper";

interface SchoolAdminDashboardProps {
  dashboardData?: any;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  dashboardData = {}
}) => {
  const { t } = useTranslation();

  const statsData = [
    {
      id: 'total-forms',
      title: t('dashboard.stats.total_forms'),
      value: dashboardData?.totalForms || 0,
      description: t('dashboard.stats.total_forms_description'),
      icon: FileText,
      variant: 'default' as const
    },
    {
      id: 'completed',
      title: t('status.completed'),
      value: dashboardData?.completedForms || 0,
      description: t('dashboard.progress.completed'),
      icon: CheckCircle,
      variant: 'success' as const,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      id: 'pending',
      title: t('status.pending'),
      value: dashboardData?.pendingForms || 0,
      description: t('status.pending_approval'),
      icon: Clock,
      variant: 'warning' as const
    },
    {
      id: 'completion-rate',
      title: t('dashboard.stats.completion_rate'),
      value: `${dashboardData?.completionRate || 0}%`,
      description: t('dashboard.progress.overall_progress'),
      icon: TrendingUp,
      variant: 'primary' as const,
      trend: {
        value: 8,
        isPositive: true
      }
    }
  ];

  return (
    <TranslationWrapper minimal>
      <div className="space-y-6 animate-fade-in-up">
        {/* Stats Grid */}
        <EnhancedStatsGrid stats={statsData} />

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Form Status Section */}
          <div className="lg:col-span-2">
            <EnhancedCard 
              title={t('dashboard.cards.overview')}
              variant="elevated"
              className="h-full"
            >
              <FormStatusSection dashboardData={dashboardData} />
            </EnhancedCard>
          </div>

          {/* Notification Card */}
          <NotificationCard maxItems={4} className="lg:row-span-1" />
        </div>

        {/* Secondary Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <EnhancedCard 
            title={t('navigation.dashboard')}
            variant="elevated"
            className="h-fit"
          >
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                {t('ui.create')}
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t('time.today')}
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                size="sm"
              >
                <Bell className="mr-2 h-4 w-4" />
                {t('notifications.notifications')}
              </Button>
            </div>
          </EnhancedCard>

          {/* Files and Links Section */}
          <FilesCard />
          <LinksCard />
        </div>

        {/* Recent Notifications - Legacy (keeping for backwards compatibility) */}
        <EnhancedCard 
          title="Köhnə bildirişlər"
          variant="outlined"
          className="opacity-50"
        >
          <NotificationList notifications={dashboardData?.notifications || []} />
          <p className="text-xs text-muted-foreground mt-2">
            Bu bölmə notification system yenilənməsi ilə əvəz ediləcək
          </p>
        </EnhancedCard>
      </div>
    </TranslationWrapper>
  );
};

export default SchoolAdminDashboard;
