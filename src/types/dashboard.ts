
export interface CompletionStats {
  percentage: number;
  total: number;
  completed: number;
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
}

export type NotificationType = 'error' | 'warning' | 'success' | 'info' | 'deadline';
