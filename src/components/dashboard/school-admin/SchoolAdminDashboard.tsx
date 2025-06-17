
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
import EnhancedCard from "@/components/ui/enhanced-card";
import { EnhancedStatsGrid } from "../enhanced/EnhancedStatsGrid";

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
      title: t('dashboard.forms.total'),
      value: dashboardData?.totalForms || 0,
      description: t('dashboard.forms.all_categories'),
      icon: FileText,
      variant: 'default' as const
    },
    {
      id: 'completed',
      title: t('dashboard.forms.completed'),
      value: dashboardData?.completedForms || 0,
      description: t('dashboard.forms.ready_for_review'),
      icon: CheckCircle,
      variant: 'success' as const,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      id: 'pending',
      title: t('dashboard.forms.pending'),
      value: dashboardData?.pendingForms || 0,
      description: t('dashboard.forms.awaiting_completion'),
      icon: Clock,
      variant: 'warning' as const
    },
    {
      id: 'completion-rate',
      title: t('dashboard.stats.completion_rate'),
      value: `${dashboardData?.completionRate || 0}%`,
      description: t('dashboard.stats.overall_progress'),
      icon: TrendingUp,
      variant: 'primary' as const,
      trend: {
        value: 8,
        isPositive: true
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats Grid */}
      <EnhancedStatsGrid stats={statsData} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Form Status Section */}
        <div className="lg:col-span-2">
          <EnhancedCard 
            title={t('dashboard.forms.status_overview')}
            variant="elevated"
            className="h-full"
          >
            <FormStatusSection data={dashboardData} />
          </EnhancedCard>
        </div>

        {/* Quick Actions */}
        <EnhancedCard 
          title={t('dashboard.quick_actions')}
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
              {t('dashboard.actions.new_form')}
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              size="sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t('dashboard.actions.view_deadlines')}
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              size="sm"
            >
              <Bell className="mr-2 h-4 w-4" />
              {t('dashboard.actions.notifications')}
            </Button>
          </div>
        </EnhancedCard>
      </div>

      {/* Files and Links Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <FilesCard />
        <LinksCard />
      </div>

      {/* Recent Notifications */}
      <EnhancedCard 
        title={t('dashboard.recent_notifications')}
        variant="outlined"
      >
        <NotificationList notifications={dashboardData?.notifications || []} />
      </EnhancedCard>
    </div>
  );
};

export default SchoolAdminDashboard;
