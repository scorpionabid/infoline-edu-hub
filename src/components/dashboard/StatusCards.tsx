
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertCircle, 
  Check, 
  Clock, 
  FileCheck, 
  FileX, 
  Layers, 
  Percent, 
  School, 
  Users, 
  AlertTriangle, 
  Building, 
  CheckCircle, 
  XCircle
} from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

interface StatusCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgClass?: string;
  description?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  bgClass = "bg-primary/5", 
  description 
}) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline mt-1">
              <h4 className="text-2xl font-bold">{value}</h4>
              {trend && (
                <span 
                  className={`ml-2 text-xs font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface RegionStatusCardsProps {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
}

export const RegionStatusCards: React.FC<RegionStatusCardsProps> = ({
  regions,
  sectors,
  schools,
  users,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title={t('regions')}
        value={regions}
        icon={<Building className="h-5 w-5 text-primary" />}
        bgClass="bg-primary/10"
      />
      <StatusCard
        title={t('sectors')}
        value={sectors}
        icon={<Layers className="h-5 w-5 text-indigo-600" />}
        bgClass="bg-indigo-600/10"
      />
      <StatusCard
        title={t('schools')}
        value={schools}
        icon={<School className="h-5 w-5 text-blue-500" />}
        bgClass="bg-blue-500/10"
      />
      <StatusCard
        title={t('users')}
        value={users}
        icon={<Users className="h-5 w-5 text-violet-500" />}
        bgClass="bg-violet-500/10"
      />
    </div>
  );
};

interface DataStatusCardsProps {
  completionRate: number;
  pendingApprovals: number;
}

export const DataStatusCards: React.FC<DataStatusCardsProps> = ({
  completionRate,
  pendingApprovals,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title={t('completionRate')}
        value={`${completionRate}%`}
        icon={<Percent className="h-5 w-5 text-emerald-600" />}
        bgClass="bg-emerald-600/10"
      />
      <StatusCard
        title={t('pendingApprovals')}
        value={pendingApprovals}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        bgClass="bg-amber-500/10"
      />
    </div>
  );
};

interface SchoolStatusCardsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  dueSoonCount: number;
}

export const SchoolStatusCards: React.FC<SchoolStatusCardsProps> = ({
  pendingCount,
  approvedCount,
  rejectedCount,
  dueSoonCount,
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatusCard
        title={t('pending')}
        value={pendingCount}
        icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
        bgClass="bg-amber-500/10"
      />
      <StatusCard
        title={t('approved')}
        value={approvedCount}
        icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        bgClass="bg-emerald-600/10"
      />
      <StatusCard
        title={t('rejected')}
        value={rejectedCount}
        icon={<XCircle className="h-5 w-5 text-red-500" />}
        bgClass="bg-red-500/10"
      />
      <StatusCard
        title={t('dueSoon')}
        value={dueSoonCount}
        icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
        bgClass="bg-orange-500/10"
      />
    </div>
  );
};

interface StatusCardsProps {
  schools?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  data?: {
    completionRate: number;
    pendingApprovals: number;
  };
  regions?: {
    count: number;
    sectors: number;
    schools: number;
    users: number;
  };
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  schools,
  data,
  regions,
}) => {
  if (regions) {
    return (
      <RegionStatusCards
        regions={regions.count}
        sectors={regions.sectors}
        schools={regions.schools}
        users={regions.users}
      />
    );
  }
  
  if (data) {
    return (
      <DataStatusCards
        completionRate={data.completionRate}
        pendingApprovals={data.pendingApprovals}
      />
    );
  }
  
  if (schools) {
    return (
      <SchoolStatusCards
        pendingCount={schools.pending}
        approvedCount={schools.approved}
        rejectedCount={schools.rejected}
        dueSoonCount={0} // Default value
      />
    );
  }
  
  return null;
};

export default StatusCards;
