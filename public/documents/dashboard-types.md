
# Dashboard Data Types and Schema Documentation

## Overview

This document provides details about the structure and organization of dashboard data types within the InfoLine application. These types define the data structures used for different user roles' dashboards.

## Primary Dashboard Data Types

### School Admin Dashboard Data

```typescript
export interface SchoolAdminDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
  status?: DashboardStatus;
  categories?: CategoryItem[] | {
    total: number;
    completed: number;
    pending: number;
    draft: number;
  };
  categoryData?: CategoryProgressData[];
  recentActivities?: any[];
  formStats?: DashboardFormStats;
  notifications?: AppNotification[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
}
```

### Region Admin Dashboard Data

```typescript
export interface RegionAdminDashboardData {
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    admins: number;
    teachers: number;
  };
  stats?: {
    sectors: number;
    schools: number;
    users: number;
  };
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  completion?: number | {
    percentage: number;
    total: number;
    completed: number;
  };
  completionRate?: number;
  categoryData?: CategoryProgressData[];
  schoolData?: SchoolCompletionData[];
  recentActivities?: any[];
  sectorStats?: SectorStat[];
  pendingApprovals?: PendingApproval[];
  categories?: CategoryItem[];
  notifications?: AppNotification[];
  pendingItems?: any[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}
```

### Sector Admin Dashboard Data

```typescript
export interface SectorAdminDashboardData {
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    admins: number;
    teachers: number;
  };
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  categoryData?: CategoryProgressData[];
  schoolData?: SchoolCompletionData[];
  recentActivities?: any[];
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  schoolStats?: SchoolStat[];
  pendingApprovals?: PendingApproval[];
}
```

### Super Admin Dashboard Data

```typescript
export interface SuperAdminDashboardData {
  users: {
    active: number;
    total: number;
    new: number;
  };
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  approvalRate?: number;
  completion?: number;
  completionRate?: number;
  categoryData?: CategoryProgressData[];
  schoolData?: SchoolCompletionData[];
  regionData?: RegionData[];
  regions?: any[];
  pendingApprovals?: PendingApproval[];
  notifications?: AppNotification[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}
```

## Supporting Types

### Status and Stats

```typescript
export type DashboardStatus = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total?: number;
  active?: number;
  inactive?: number;
};

export interface DashboardFormStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft: number;
}
```

### Items and Entities

```typescript
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  completionRate: number;
  status: string;
  deadline?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate?: string;
  status: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  daysLeft?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalEntries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  completion?: number;
  status?: string;
  lastUpdate?: string;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  pendingForms?: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  completion?: number;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedBy?: string;
  submittedAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  title?: string;
  count?: number;
  date?: string;
}
```

## Usage Guidelines

1. **Handle Optional Properties**: Many properties are optional (denoted by `?`). Always provide fallback values.

   ```typescript
   const status = data.status || { pending: 0, approved: 0, rejected: 0, draft: 0, total: 0 };
   ```

2. **Type Checking for Arrays**: When working with arrays, check if they exist and are arrays.

   ```typescript
   const categories = Array.isArray(data.categories) ? data.categories : [];
   ```

3. **Union Type Handling**: Some properties like `completion` can be of different types. Handle each case.

   ```typescript
   const completionPercentage = 
     typeof data.completion === 'object' && data.completion ? 
       data.completion.percentage : 
       (typeof data.completion === 'number' ? data.completion : data.completionRate || 0);
   ```
