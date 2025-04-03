
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/context/LanguageContext';
import { 
  Building, 
  Users, 
  FileText, 
  BarChart4,
  School,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
    increasing: boolean;
  };
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  className = ""
}) => {
  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-1">
            <span className={trend.increasing ? "text-green-500" : "text-red-500"}>
              {trend.increasing ? "↑" : "↓"} {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const RegionsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("regions")} 
      value={value} 
      icon={<Building />} 
      description={t("totalRegionsDesc")}
    />
  );
};

export const SectorsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("sectors")} 
      value={value} 
      icon={<Building className="h-4 w-4" />} 
      description={t("totalSectorsDesc")}
    />
  );
};

export const SchoolsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("schools")} 
      value={value} 
      icon={<School className="h-4 w-4" />} 
      description={t("totalSchoolsDesc")}
    />
  );
};

export const UsersCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("users")} 
      value={value} 
      icon={<Users className="h-4 w-4" />} 
      description={t("totalUsersDesc")}
    />
  );
};

export const CompletionRateCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("completionRate")} 
      value={`${value}%`} 
      icon={<BarChart4 className="h-4 w-4" />} 
      description={t("completionRateDesc")}
    />
  );
};

export const ApprovalRateCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("approvalRate")} 
      value={`${value}%`} 
      icon={<CheckCircle className="h-4 w-4" />} 
      description={t("approvalRateDesc")}
    />
  );
};

export const PendingApprovalsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("pendingApprovals")} 
      value={value} 
      icon={<Clock className="h-4 w-4" />} 
      description={t("pendingApprovalsDesc")}
    />
  );
};

export const PendingSchoolsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("pendingSchools")} 
      value={value} 
      icon={<School className="h-4 w-4" />} 
      description={t("pendingSchoolsDesc")}
    />
  );
};

export const ApprovedSchoolsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("approvedSchools")} 
      value={value} 
      icon={<CheckCircle className="h-4 w-4" />} 
      description={t("approvedSchoolsDesc")}
    />
  );
};

export const RejectedSchoolsCard: React.FC<{value: number}> = ({value}) => {
  const { t } = useLanguage();
  return (
    <StatusCard 
      title={t("rejectedSchools")} 
      value={value} 
      icon={<XCircle className="h-4 w-4" />} 
      description={t("rejectedSchoolsDesc")}
    />
  );
};

export const FormsCard: React.FC<{value: number, type: string}> = ({value, type}) => {
  const { t } = useLanguage();
  
  let icon = <FileText className="h-4 w-4" />;
  let title = t("forms");
  let description = t("formsDesc");
  
  switch (type) {
    case 'pending':
      title = t("pendingForms");
      description = t("pendingFormsDesc");
      icon = <Clock className="h-4 w-4" />;
      break;
    case 'approved':
      title = t("approvedForms");
      description = t("approvedFormsDesc");
      icon = <CheckCircle className="h-4 w-4" />;
      break;
    case 'rejected':
      title = t("rejectedForms");
      description = t("rejectedFormsDesc");
      icon = <XCircle className="h-4 w-4" />;
      break;
    case 'dueSoon':
      title = t("dueSoonForms");
      description = t("dueSoonFormsDesc");
      icon = <Clock className="h-4 w-4" />;
      break;
    case 'overdue':
      title = t("overdueForms");
      description = t("overdueFormsDesc");
      icon = <XCircle className="h-4 w-4" />;
      break;
  }
  
  return (
    <StatusCard 
      title={title} 
      value={value} 
      icon={icon} 
      description={description}
    />
  );
};

// Bütün kartları bir yerdə ixrac etmək üçün
export { StatusCard };
