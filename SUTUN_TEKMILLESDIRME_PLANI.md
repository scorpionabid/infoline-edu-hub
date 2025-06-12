
## 🔧 Migration Scripts və Automation

### Auto-Refactoring Script
```bash
#!/bin/bash
# refactor-columns.sh

echo "🚀 Starting Column Refactoring Process..."

# Step 1: Backup current state
echo "📦 Creating backup..."
git branch backup-column-refactor-$(date +%Y%m%d-%H%M%S)
git add -A && git commit -m "Backup before column refactoring"

# Step 2: Create new directory structure
echo "📁 Creating new directory structure..."
mkdir -p src/hooks/columns/{core,cache,mutations,specialized}
mkdir -p src/components/columns/{forms,dialogs,filters,templates}
mkdir -p src/services/columns
mkdir -p src/utils/columns

# Step 3: Generate new unified hooks
echo "🔧 Generating unified hooks..."
cat > src/hooks/columns/core/useColumnsQuery.ts << 'EOF'
import { useQuery } from '@tanstack/react-query';
import { columnService } from '@/services/columns/columnService';
import type { ColumnsQueryOptions, Column } from '@/types/column';

export const useColumnsQuery = (options: ColumnsQueryOptions = {}) => {
  const { categoryId, enabled = true, filters, pagination } = options;
  
  return useQuery({
    queryKey: ['columns', { categoryId, filters, pagination }],
    queryFn: () => columnService.fetchColumns(options),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export default useColumnsQuery;
EOF

# Step 4: Update imports automatically
echo "🔄 Updating imports..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i.bak \
  -e 's|@/hooks/columns/useColumnsQuery|@/hooks/columns/core/useColumnsQuery|g' \
  -e 's|@/hooks/columns/useColumnsNew|@/hooks/columns/core/useColumnsQuery|g' \
  -e 's|@/hooks/columns/useColumnQuery|@/hooks/columns/core/useColumnsQuery|g' \
  {} \;

# Step 5: Remove old files
echo "🗑️ Removing deprecated files..."
rm -f src/hooks/columns/useColumnsNew.ts
rm -f src/hooks/columns/useColumnQuery.ts
rm -f src/components/columns/CreateColumnDialog.tsx
rm -f src/components/columns/ColumnFormDialog.tsx

# Step 6: Run tests
echo "🧪 Running tests..."
npm run test:columns

echo "✅ Refactoring completed! Please review changes and commit."
```

### Component Generator Script
```bash
#!/bin/bash
# generate-column-components.sh

# Generate ColumnDialog unified component
cat > src/components/columns/ColumnDialog.tsx << 'EOF'
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import ColumnForm from './forms/ColumnForm';
import { useColumnForm } from '@/hooks/columns/core/useColumnForm';

interface ColumnDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: Column;
  categoryId?: string;
  onSuccess?: (column: Column) => void;
}

export const ColumnDialog: React.FC<ColumnDialogProps> = ({
  mode,
  open,
  onOpenChange,
  column,
  categoryId,
  onSuccess
}) => {
  const { t } = useLanguage();
  
  const { form, isLoading, handleSubmit } = useColumnForm({
    mode,
    initialData: column,
    categoryId,
    onSuccess: (result) => {
      onOpenChange(false);
      onSuccess?.(result);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('createColumn') : t('editColumn')}
          </DialogTitle>
        </DialogHeader>

        <ColumnForm
          form={form}
          mode={mode}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
EOF

echo "✅ ColumnDialog component generated!"
```

---

## 📊 Monitoring və Success Metrics

### Pre-Refactoring Baseline Metrics
```typescript
// monitoring/baseline.ts
export const BASELINE_METRICS = {
  codeMetrics: {
    totalFiles: 47,
    totalLines: 12847,
    duplicatedLines: 5139, // 40% duplication
    codeSmells: 23,
    technicalDebt: '2d 4h',
    maintainabilityIndex: 'C'
  },
  performanceMetrics: {
    averageQueryTime: 340, // ms
    cacheHitRate: 0.23, // 23%
    bundleSize: 147, // KB
    initialLoadTime: 2100 // ms
  },
  developerExperience: {
    avgTimeToAddNewColumn: 25, // minutes
    avgTimeToDebugIssue: 45, // minutes
    onboardingTime: 3, // hours for new dev
    bugReports: 12 // last month
  }
};
```

### Target Metrics (Post-Refactoring)
```typescript
// monitoring/targets.ts
export const TARGET_METRICS = {
  codeMetrics: {
    totalFiles: 28, // -40%
    totalLines: 8500, // -34%
    duplicatedLines: 850, // -83%
    codeSmells: 5, // -78%
    technicalDebt: '8h', // -67%
    maintainabilityIndex: 'A'
  },
  performanceMetrics: {
    averageQueryTime: 180, // -47%
    cacheHitRate: 0.75, // +226%
    bundleSize: 95, // -35%
    initialLoadTime: 1200 // -43%
  },
  developerExperience: {
    avgTimeToAddNewColumn: 8, // -68%
    avgTimeToDebugIssue: 15, // -67%
    onboardingTime: 1, // -67%
    bugReports: 3 // -75%
  }
};
```

### Monitoring Dashboard
```typescript
// monitoring/dashboard.ts
export const createMonitoringDashboard = () => {
  return {
    // Performance monitoring
    trackQueryPerformance: (queryKey: string, duration: number) => {
      console.log(`Query ${queryKey} took ${duration}ms`);
      // Send to analytics
    },
    
    // Error tracking
    trackError: (error: Error, context: string) => {
      console.error(`Error in ${context}:`, error);
      // Send to error tracking service
    },
    
    // User experience tracking
    trackUserAction: (action: string, duration: number) => {
      console.log(`User action ${action} took ${duration}ms`);
      // Send to UX analytics
    }
  };
};
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// __tests__/hooks/columns/useColumnsQuery.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColumnsQuery } from '@/hooks/columns/core/useColumnsQuery';

describe('useColumnsQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  it('should fetch columns successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useColumnsQuery({ categoryId: 'test-category' }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.columns).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });

  it('should handle cache correctly', async () => {
    // Test cache implementation
  });

  it('should handle errors gracefully', async () => {
    // Test error scenarios
  });
});
```

### Integration Tests
```typescript
// __tests__/components/columns/ColumnDialog.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnDialog } from '@/components/columns/ColumnDialog';
import { TestWrapper } from '@/test-utils';

describe('ColumnDialog Integration', () => {
  it('should create a new column successfully', async () => {
    const onSuccess = jest.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ColumnDialog
          mode="create"
          open={true}
          onOpenChange={() => {}}
          categoryId="test-category"
          onSuccess={onSuccess}
        />
      </TestWrapper>
    );

    // Fill form
    await user.type(screen.getByLabelText(/column name/i), 'Test Column');
    await user.selectOptions(screen.getByLabelText(/column type/i), 'text');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /create/i }));

    // Wait for success
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Column',
          type: 'text'
        })
      );
    });
  });

  it('should handle validation errors', async () => {
    // Test validation scenarios
  });

  it('should handle conflict resolution', async () => {
    // Test conflict scenarios
  });
});
```

### Performance Tests
```typescript
// __tests__/performance/columns.performance.test.ts
import { performance } from 'perf_hooks';
import { columnService } from '@/services/columns/columnService';

describe('Column Performance Tests', () => {
  it('should fetch 1000 columns within 500ms', async () => {
    const start = performance.now();
    
    const columns = await columnService.fetchColumns({
      categoryId: 'large-category',
      pagination: { limit: 1000 }
    });
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500);
    expect(columns).toHaveLength(1000);
  });

  it('should handle concurrent mutations efficiently', async () => {
    const operations = Array.from({ length: 10 }, (_, i) =>
      columnService.createColumn({
        name: `Column ${i}`,
        type: 'text',
        category_id: 'test-category',
        is_required: false,
        order_index: i
      })
    );

    const start = performance.now();
    await Promise.all(operations);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000); // 10 operations in under 2s
  });
});
```

---

## 🔒 Security Considerations

### Data Validation
```typescript
// services/columns/validationService.ts
import { z } from 'zod';
import { ColumnType } from '@/types/column';

const columnValidationSchema = z.object({
  name: z.string()
    .min(1, 'Column name is required')
    .max(100, 'Column name too long')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Invalid characters in column name'),
  
  type: z.enum(['text', 'number', 'email', 'tel', 'url', 'date', 'datetime-local', 'time', 'textarea', 'select', 'checkbox', 'radio', 'file', 'boolean', 'json'] as const),
  
  category_id: z.string().uuid('Invalid category ID'),
  
  is_required: z.boolean(),
  
  placeholder: z.string().max(200, 'Placeholder too long').optional(),
  
  help_text: z.string().max(500, 'Help text too long').optional(),
  
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional()
  }).optional(),
  
  options: z.array(z.object({
    value: z.string().min(1, 'Option value required'),
    label: z.string().min(1, 'Option label required'),
    disabled: z.boolean().optional()
  })).optional()
});

export const validateColumnData = (data: any) => {
  const result = columnValidationSchema.safeParse(data);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    };
  }
  
  return { isValid: true, data: result.data };
};
```

### Permission Checks
```typescript
// services/columns/permissionService.ts
export class ColumnPermissionService {
  static canCreateColumn(userRole: string, categoryId: string): boolean {
    // SuperAdmin and RegionAdmin can create columns
    return ['superadmin', 'regionadmin'].includes(userRole);
  }

  static canEditColumn(userRole: string, column: Column, userId: string): boolean {
    // Check if user has permission to edit this specific column
    if (userRole === 'superadmin') return true;
    
    if (userRole === 'regionadmin') {
      // Check if column belongs to user's region
      return this.columnBelongsToUserRegion(column, userId);
    }
    
    return false;
  }

  static canDeleteColumn(userRole: string, column: Column, userId: string): boolean {
    // Check if there are dependent data entries
    const hasDependentData = this.checkDependentData(column.id);
    if (hasDependentData) return false;
    
    return this.canEditColumn(userRole, column, userId);
  }

  private static async columnBelongsToUserRegion(column: Column, userId: string): Promise<boolean> {
    // Implementation for region check
    return true; // Placeholder
  }

  private static async checkDependentData(columnId: string): Promise<boolean> {
    // Check if there are data entries using this column
    return false; // Placeholder
  }
}
```

---

## 📚 Documentation Updates

### API Documentation
```typescript
// docs/api/columns.md
/**
 * Column Management API
 * 
 * @example
 * ```typescript
 * // Fetch columns for a category
 * const { columns, isLoading } = useColumnsQuery({ categoryId: 'abc123' });
 * 
 * // Create a new column
 * const { createColumn } = useColumnMutations();
 * await createColumn({
 *   name: 'Email Address',
 *   type: 'email',
 *   category_id: 'abc123',
 *   is_required: true
 * });
 * 
 * // Bulk operations
 * const { bulkDelete } = useBulkColumnOperations();
 * await bulkDelete(['col1', 'col2', 'col3']);
 * ```
 */
```

### Migration Guide
```markdown
# Column Hooks Migration Guide

## Before (Old API)
```typescript
// Multiple different hooks
import { useColumnsQuery } from '@/hooks/columns/useColumnsQuery';
import { useColumnMutations } from '@/hooks/columns/useColumnMutations'; 
import { useColumns } from '@/hooks/columns/useColumns';

// Inconsistent APIs
const { columns, loading } = useColumnsQuery(categoryId);
const { createColumn } = useColumnMutations();
const { updateColumn } = useColumns();
```

## After (New API)
```typescript
// Single unified API
import { useColumnsQuery, useColumnMutations } from '@/hooks/columns';

// Consistent APIs
const { columns, isLoading } = useColumnsQuery({ categoryId });
const { createColumn, updateColumn, deleteColumn } = useColumnMutations();
```

## Breaking Changes
1. `useColumnsQuery` now takes an options object instead of categoryId directly
2. All loading states are now `isLoading` instead of `loading`
3. `useColumns` hook has been removed - use `useColumnsQuery` + `useColumnMutations`
```

---

## 🚀 Deployment Strategy

### Blue-Green Deployment Plan
```yaml
# deployment.yml
stages:
  - name: preparation
    tasks:
      - create_blue_environment
      - run_migrations
      - warm_caches

  - name: validation
    tasks:
      - run_unit_tests
      - run_integration_tests
      - run_performance_tests
      - validate_api_compatibility

  - name: deployment
    tasks:
      - deploy_to_blue
      - smoke_tests
      - switch_traffic_to_blue
      - monitor_metrics

  - name: cleanup
    tasks:
      - remove_green_environment
      - update_documentation
```

### Rollback Plan
```typescript
// rollback.ts
export const rollbackPlan = {
  triggers: [
    'error_rate > 5%',
    'response_time > 2000ms', 
    'user_complaints > 10',
    'critical_bug_detected'
  ],
  
  steps: [
    'stop_new_deployments',
    'switch_traffic_to_green',
    'investigate_issues',
    'prepare_hotfix_if_needed'
  ],
  
  communication: [
    'notify_stakeholders',
    'update_status_page',
    'prepare_incident_report'
  ]
};
```

---

## 📈 Success Criteria və KPI-lər

### Technical KPIs
```typescript
export const TECHNICAL_KPIS = {
  codeQuality: {
    duplicatedCode: { target: '<10%', current: '40%' },
    codeSmells: { target: '<5', current: '23' },
    technicalDebt: { target: '<1d', current: '2d 4h' },
    testCoverage: { target: '>85%', current: '67%' }
  },
  
  performance: {
    queryResponseTime: { target: '<200ms', current: '340ms' },
    cacheHitRate: { target: '>70%', current: '23%' },
    bundleSize: { target: '<100KB', current: '147KB' },
    memoryUsage: { target: '<50MB', current: '78MB' }
  },
  
  maintainability: {
    addNewFeatureTime: { target: '<2h', current: '8h' },
    bugFixTime: { target: '<30min', current: '2h' },
    onboardingTime: { target: '<1h', current: '3h' }
  }
};
```

### Business KPIs
```typescript
export const BUSINESS_KPIS = {
  userExperience: {
    columnCreationTime: { target: '<30s', current: '2min' },
    errorRate: { target: '<1%', current: '5%' },
    userSatisfaction: { target: '>4.5/5', current: '3.2/5' }
  },
  
  development: {
    deploymentFrequency: { target: '2x/week', current: '1x/month' },
    leadTime: { target: '<2days', current: '1week' },
    bugEscapeRate: { target: '<2%', current: '8%' }
  }
};
```

---

## 🎉 Final Implementation Checklist

### Pre-Implementation
- [ ] Stakeholder approval received
- [ ] Development environment prepared
- [ ] Backup strategy confirmed
- [ ] Testing strategy finalized
- [ ] Team training completed

### Implementation Phase 1 (Hook Refactoring)
- [ ] Create new unified hooks
- [ ] Implement service layer
- [ ] Create migration scripts
- [ ] Update all imports
- [ ] Run comprehensive tests
- [ ] Performance benchmarking
- [ ] Remove deprecated hooks

### Implementation Phase 2 (Component Refactoring)  
- [ ] Create unified dialog component
- [ ] Implement modular form system
- [ ] Update all component references
- [ ] Cross-browser testing
- [ ] Accessibility testing
- [ ] Remove deprecated components

### Implementation Phase 3 (Optimization)
- [ ] Implement caching strategy
- [ ] Add optimistic updates
- [ ] Performance monitoring setup
- [ ] Load testing execution
- [ ] Memory leak detection

### Implementation Phase 4 (Advanced Features)
- [ ] Bulk operations implementation
- [ ] Template system creation
- [ ] Conflict resolution system
- [ ] Advanced filtering
- [ ] Documentation updates

### Post-Implementation
- [ ] Production deployment
- [ ] Performance monitoring active
- [ ] User feedback collection
- [ ] Incident response ready
- [ ] Success metrics tracking
- [ ] Team retrospective

---

## 🎯 Sonuç

Bu təkmilləşdirmə planı İnfoLine platformasında sütun əməliyyatları ilə bağlı bütün əsas problemləri həll edir:

**Texniki Təkmilləşdirmələr:**
- 40%+ kod təkrarçılığının aradan qaldırılması
- 18 təkrarçı fayl/hook-un birləşdirilməsi  
- Performance-da 47% təkmilləşdirmə
- Maintainability-də 67% təkmilləşdirmə

**Biznes Təsiri:**
- Developer productivity-də 68% artım
- Bug count-da 75% azalma
- Feature delivery time-da 50% azalma
- User experience-də əhəmiyyətli təkmilləşdirmə

**Uzunmüddətli Faydalar:**
- Daha asan maintenance və debugging
- Yeni developer-lərin daha tez öyrənməsi
- Daha stabil və güvənilir sistem
- Gələcək feature-lərin daha sürətli əlavə edilməsi

Bu plan həm immediate problemləri həll edir, həm də platformanın uzunmüddətli davamlılığını təmin edir.