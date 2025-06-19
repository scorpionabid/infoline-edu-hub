# İnfoLine Approval System - Detallı İmplementasiya Planı v2.0 (Hissə 2/4)

## Phase 2: Enhanced Services və Hooks (2 gün)

### 2.1 Enhanced Approval Service
**Fayl**: `src/services/approval/enhancedApprovalService.ts`

Bu service mövcud `StatusTransitionService` ilə inteqrasiya olaraq real approval functionality təmin edir.

**Key Features:**
- ✅ Real data integration with Supabase
- ✅ Permission-based operations
- ✅ Bulk approval/rejection
- ✅ Notification integration
- ✅ Error handling və validation

**[ESTIMATE: ~150 lines TypeScript kod, tam functional service]**

### 2.2 Enhanced Hooks

#### 2.2.1 useEnhancedApprovalData Hook
**Fayl**: `src/hooks/approval/useEnhancedApprovalData.ts`

```typescript
export const useEnhancedApprovalData = (props: UseEnhancedApprovalDataProps = {}) => {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApprovalFilter>(props.initialFilter || { status: 'pending' });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    total: 0
  });

  // Real-time subscription
  useEffect(() => {
    if (!props.autoRefresh) return;

    const subscription = supabase
      .channel('approval-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_entries',
        filter: 'status=in.(pending,approved,rejected)'
      }, () => {
        loadItems();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [props.autoRefresh]);

  // Auto-refresh interval
  useEffect(() => {
    if (!props.autoRefresh || !props.refreshInterval) return;

    const interval = setInterval(loadItems, props.refreshInterval);
    return () => clearInterval(interval);
  }, [props.autoRefresh, props.refreshInterval, loadItems]);

  // Derived data
  const pendingItems = useMemo(() => 
    items.filter(item => item.status === 'pending'), [items]
  );
  
  const approvedItems = useMemo(() => 
    items.filter(item => item.status === 'approved'), [items]
  );
  
  const rejectedItems = useMemo(() => 
    items.filter(item => item.status === 'rejected'), [items]
  );

  return {
    // Data
    items,
    stats,
    filter,
    
    // States
    isLoading,
    error,
    
    // Actions
    loadItems,
    approveItem,
    rejectItem,
    bulkApproval,
    updateFilter,
    resetFilter,
    
    // Derived data
    pendingItems,
    approvedItems,
    rejectedItems,
  };
};
```

#### 2.2.2 useApprovalPermissions Hook
**Fayl**: `src/hooks/approval/useApprovalPermissions.ts`

Bu hook istifadəçinin approval icazələrini real-time yoxlayır:

```typescript
interface UserPermissions {
  canApproveInRegion: (regionId: string) => boolean;
  canApproveInSector: (sectorId: string) => boolean;
  canApproveInSchool: (schoolId: string) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  regions: string[];
  sectors: string[];
  schools: string[];
}

export const useApprovalPermissions = () => {
  // Permission checking logic
  // Real-time role validation
  // School/sector/region access validation
};
```

#### 2.2.3 useDataEntryWithApproval Hook
**Fayl**: `src/hooks/dataEntry/useDataEntryWithApproval.ts`

Mövcud `useDataEntryManager` hook-unu approval workflow ilə enhance edir:

```typescript
export const useDataEntryWithApproval = (props: UseDataEntryWithApprovalProps) => {
  const dataEntryManager = useDataEntryManager({
    schoolId: props.schoolId,
    userId: props.userId || user?.id,
    autoSave: props.autoSave,
    enableRealTime: props.enableRealTime
  });

  // Enhanced submission for approval
  const submitForApproval = useCallback(async (comment?: string) => {
    // Save data first
    // Transition to PENDING status
    // Send notifications
    // Return results
  }, []);

  // Check if data can be submitted
  const canSubmitForApproval = useCallback(() => {
    const hasData = Object.keys(dataEntryManager.formData).length > 0;
    const statusAllowsSubmission = 
      dataEntryManager.entryStatus === 'draft' || 
      dataEntryManager.entryStatus === 'rejected';
    
    return hasData && statusAllowsSubmission;
  }, [dataEntryManager.formData, dataEntryManager.entryStatus]);

  return {
    // Base data entry functionality
    ...dataEntryManager,
    
    // Approval-specific functionality
    submitForApproval,
    canSubmitForApproval,
    getSubmissionStatus
  };
};
```

### 2.3 Service Integration Strategy

#### 2.3.1 StatusTransitionService Enhancement
**Mövcud fayl**: `src/services/statusTransitionService.ts`

Bu service artıq 90% hazırdır, yalnız aşağıdakı enhancement-lər lazımdır:

```typescript
// EXISTING - Already functional
export class StatusTransitionService {
  static async executeTransition() // ✅ Working
  static async canTransition() // ✅ Working
  static async getCurrentStatus() // ✅ Working
  static getAvailableActions() // ✅ Working
}

// NEEDED ENHANCEMENT
static async bulkTransition(entries: BulkTransitionRequest[]) {
  // Process multiple entries at once
  // Return bulk results
}

static subscribeToStatusChanges(callback: (change: StatusChange) => void) {
  // Real-time status change subscription
  // WebSocket integration
}
```

#### 2.3.2 Notification Service Enhancement
**Mövcud fayl**: `src/services/notificationService.ts`

```typescript
// NEEDED ENHANCEMENT
export class NotificationService {
  static async sendApprovalNotifications(
    schoolId: string,
    categoryId: string,
    action: 'approved' | 'rejected',
    adminId: string,
    comment?: string
  ) {
    // Get relevant users to notify
    // Create notification entries
    // Send real-time updates
  }

  static async sendBulkApprovalNotifications(
    results: BulkApprovalResult[]
  ) {
    // Process bulk notification sending
    // Group by recipient
    // Send consolidated notifications
  }
}
```

### 2.4 Data Flow və Integration

#### 2.4.1 School Admin Data Entry Flow
```
SchoolAdmin → useDataEntryWithApproval → submitForApproval() → 
StatusTransitionService.executeTransition() → 
EnhancedApprovalService.sendApprovalNotification() → 
Real-time update to Admin dashboards
```

#### 2.4.2 Admin Approval Flow
```
Admin → useEnhancedApprovalData → approveItem() → 
EnhancedApprovalService.approveEntry() → 
StatusTransitionService.executeTransition() → 
NotificationService.sendApprovalNotifications() → 
Real-time update to SchoolAdmin
```

#### 2.4.3 Bulk Operations Flow
```
Admin → Select multiple items → bulkApproval() → 
EnhancedApprovalService.bulkApprovalAction() → 
Process each item individually → 
StatusTransitionService.executeTransition() (multiple) → 
Consolidated notification sending
```

### 2.5 Error Handling Strategy

#### 2.5.1 Service Level Error Handling
```typescript
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string; // Error codes for specific handling
}

// Standard error response format
try {
  // Operation
  return { success: true, data: result };
} catch (error: any) {
  console.error('Service error:', error);
  return { 
    success: false, 
    error: error.message,
    code: error.code || 'UNKNOWN_ERROR'
  };
}
```

#### 2.5.2 UI Level Error Handling
```typescript
// Hook level error handling
const { error, isLoading } = useEnhancedApprovalData();

if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error}
        <Button onClick={retryAction}>Retry</Button>
      </AlertDescription>
    </Alert>
  );
}
```

### 2.6 Performance Optimization

#### 2.6.1 Data Loading Optimization
- **Pagination**: 50 items per page default
- **Filtering**: Server-side filtering through SQL functions
- **Caching**: React Query integration for data caching
- **Real-time**: Selective real-time updates only for critical changes

#### 2.6.2 State Management Optimization
- **Memoization**: useMemo və useCallback proper usage
- **State splitting**: Separate loading states for different operations
- **Optimistic updates**: UI updates before server confirmation

---

**Növbəti Hissələr:**
- **Hissə 3**: React Components (Filters, Modals, Bulk Operations)
- **Hissə 4**: Integration Testing və Final Implementation

**[ESTIMATE: Bu hissə service layer və hooks-u əhatə edir, ~4000 token]**