
export interface CompletionStats {
  percentage: number;
  total: number;
  completed: number;
}

export interface StatsItem {
  title: string;
  count: number;
  icon?: React.ReactNode;
  description?: string;
  change?: number;
  status?: 'up' | 'down' | 'neutral';
  label?: string;
  value?: number;
}

export interface SuperAdminDashboardData {
  counts: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    totalSchools?: number;
  };
  completion: CompletionStats;
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    draft?: number;
  };
  regions: {
    id: string;
    name: string;
    completion: CompletionStats;
    schoolCount?: number;
    sectorCount?: number;
    completionRate?: number;
  }[];
  schools: {
    id: string;
    name: string;
    region: string;
    sector: string;
    completion: CompletionStats;
  }[];
  categories: {
    id: string;
    name: string;
    schools: number;
    completion: CompletionStats;
  }[];
  upcoming: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
    completed?: number;
  };
  regionStats?: {
    [key: string]: {
      name: string;
      schools: number;
      sectors: number;
      completion: number;
    }
  };
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    total?: number;
  };
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dueSoon?: number;
  };
  pendingApprovals?: PendingItem[];
  completionRate?: number;
  notifications?: DashboardNotification[];
  users?: number;
}

export interface RegionAdminDashboardData {
  counts: {
    sectors: number;
    schools: number;
    users: number;
  };
  completion: CompletionStats;
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  sectors?: {
    id: string;
    name: string;
    schools: number;
    completion: CompletionStats;
  }[];
  schools: {
    id: string;
    name: string;
    sector: string;
    completion: CompletionStats;
  }[];
  categories: {
    id: string;
    name: string;
    schools: number;
    completion: CompletionStats;
  }[];
  upcoming: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingSchools?: {
    id: string;
    name: string;
    sector: string;
    percentage: number;
  }[];
  sectorStats?: {
    [key: string]: {
      name: string;
      schools: number;
      completion: number;
    }
  };
  stats?: {
    sectors: number;
    schools: number;
    users: number;
  };
  sectorCompletions?: SectorCompletionItem[];
  completionRate?: number;
  pendingApprovals?: PendingItem[];
  notifications?: DashboardNotification[];
  users?: number;
}

export interface SectorAdminDashboardData {
  counts: {
    schools: number;
    users?: number;
  };
  completion: CompletionStats;
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  schools?: {
    id: string;
    name: string;
    completion: CompletionStats;
  }[];
  categories: {
    id: string;
    name: string;
    schools: number;
    completion: CompletionStats;
  }[];
  upcoming: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingApprovals?: {
    id: string;
    school: string;
    category: string;
    submitted: string;
  }[];
  stats?: {
    schools: number;
    users?: number;
  };
  completionRate?: number;
  pendingItems?: PendingItem[];
  schoolsStats?: SchoolStat[];
  notifications?: DashboardNotification[];
  activityLog?: ActivityLogItem[];
}

export interface SchoolAdminDashboardData {
  completion: CompletionStats;
  status: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  categories: {
    id: string;
    name: string;
    completion: CompletionStats;
    status: 'pending' | 'approved' | 'rejected' | 'incomplete' | 'complete';
    deadline?: string;
  }[];
  upcoming: {
    id: string;
    name: string;
    deadline: string;
    daysLeft: number;
    completion: number;
  }[];
  recentActivity?: {
    id: string;
    action: string;
    category: string;
    timestamp: string;
    status?: string;
  }[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: FormItem[];
  completionRate?: number;
  notifications?: DashboardNotification[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'error' | 'warning' | 'success' | 'info' | 'deadline';
  read: boolean;
  userId?: string;
  priority?: 'low' | 'medium' | 'high';
  relatedEntityId?: string;
  relatedEntityType?: string;
  date?: string;
  time?: string;
  createdAt?: string;
  isRead?: boolean;
}

export type NotificationType = 'error' | 'warning' | 'success' | 'info' | 'deadline';

export interface FormItem {
  id: string;
  title: string;
  category?: string;
  date?: string;
  status: string;
  completionPercentage: number;
}

export interface PendingItem {
  id: string;
  title?: string;
  school?: string;
  schoolName?: string;
  category?: string;
  categoryName?: string;
  date?: string;
  dueDate?: string;
  submittedAt?: string;
  status?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionPercentage: number;
  pendingItems?: number;
  status?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
  status?: string;
  deadline?: string;
  columnCount?: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
  completion?: CompletionStats;
  completionRate?: number;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}

export interface RegionStats {
  id: string;
  name: string;
  schoolCount: number;
  sectorCount: number;
  completionRate: number;
  completion?: CompletionStats;
}
