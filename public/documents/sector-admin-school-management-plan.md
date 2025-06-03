# SectorAdmin Məktəb İdarəetmə Paneli - Dəqiq İmplementation Planı

**Proyekt**: İnfoLine - SectorAdmin School Management Enhancement  
**Başlama Tarixi**: 6 İyun 2025, 07:40  
**Status**: 📋 Planlaşdırılır  
**Məsul**: Development Team

---

## 🎯 **MƏQSƏD VƏ SCOPE**

SectorAdmin üçün məktəblərin tamamlama statistikasını real-time izləyə bilmə, məktəb əvəzindən data daxil etmə, toplu əməliyyatlar və smart filter sistemi yaratmaq.

**Gözlənilən nəticələr:**
- ⚡ 70% sürətli məktəb monitoring prosesi
- 📊 Real-time completion tracking
- 🎯 Bulk operations - 10+ məktəbi eyni vaxtda idarə et
- 🔍 Advanced filtering və search

---

## 📁 **DETAILED FILE STRUCTURE**

### **Phase 1: Core Components (4 saat)**

#### 📄 **1.1. src/components/sectorAdmin/SchoolManagementDashboard.tsx**
```typescript
interface SchoolManagementDashboardProps {
  sectorId: string;
  currentUser: User;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  completedCategories: number;
  totalCategories: number;
  lastActivity: Date;
  status: 'completed' | 'pending' | 'overdue' | 'not-started';
  pendingApprovals: number;
  studentCount?: number;
  contactInfo?: string;
}

// Features:
// - Sektor statistikaları header
// - School list table
// - Bulk operations panel
// - Filter sidebar
// - Export functionality
```

#### 📄 **1.2. src/components/sectorAdmin/SchoolDataTable.tsx**
```typescript
interface SchoolDataTableProps {
  schools: SchoolStats[];
  selectedSchools: string[];
  onSchoolSelect: (schoolIds: string[]) => void;
  onSchoolEdit: (schoolId: string) => void;
  onSendNotification: (schoolId: string) => void;
  sortConfig: SortConfig;
  onSort: (field: keyof SchoolStats) => void;
  isLoading?: boolean;
}

interface SortConfig {
  field: keyof SchoolStats;
  direction: 'asc' | 'desc';
}

// Features:
// - Virtual scrolling for performance
// - Progress bars for completion rates
// - Action buttons per row
// - Bulk selection checkboxes
// - Sortable columns
// - Mobile responsive
```

#### 📄 **1.3. src/components/sectorAdmin/BulkOperationsPanel.tsx**
```typescript
interface BulkOperationsPanelProps {
  selectedSchools: string[];
  totalSchools: number;
  onBulkNotification: () => void;
  onBulkDataEntry: () => void;
  onBulkExport: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

// Features:
// - Selection summary
// - Bulk operation buttons
// - Progress tracking for operations
// - Confirmation dialogs
```

#### 📄 **1.4. src/components/sectorAdmin/SchoolFilterPanel.tsx**
```typescript
interface FilterOptions {
  searchQuery: string;
  categoryId?: string;
  completionRange: [number, number];
  lastActivity: 'today' | 'week' | 'month' | 'all';
  status: 'all' | 'completed' | 'pending' | 'overdue' | 'not-started';
  studentCountRange?: [number, number];
}

interface SchoolFilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Category[];
  onResetFilters: () => void;
}

// Features:
// - Search by school name
// - Category filter dropdown
// - Completion rate slider
// - Last activity filter
// - Status filter
// - Student count range
// - Clear all filters
```

### **Phase 2: Modals və Forms (3 saat)**

#### 📄 **2.1. src/components/sectorAdmin/SchoolDataEditModal.tsx**
```typescript
interface SchoolDataEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  categoryId?: string;
  onDataSaved: () => void;
}

interface DataEntryForm {
  schoolId: string;
  categoryId: string;
  columnData: Record<string, any>;
  notes?: string;
  submitForApproval: boolean;
}

// Features:
// - Category selection dropdown
// - Dynamic form based on column types
// - Form validation
// - Draft save functionality
// - Submit for approval
// - Audit log entry
```

#### 📄 **2.2. src/components/sectorAdmin/NotificationModal.tsx**
```typescript
interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientSchools: string[];
  onNotificationSent: () => void;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface NotificationForm {
  templateId?: string;
  customSubject?: string;
  customBody?: string;
  priority: 'normal' | 'high' | 'urgent';
  deliveryMethod: 'system' | 'email' | 'both';
  scheduleFor?: Date;
}

// Features:
// - Template selection
// - Custom message creation
// - Variable replacement (school name, deadline, etc.)
// - Priority setting
// - Delivery method selection
// - Schedule notification
// - Preview functionality
```

#### 📄 **2.3. src/components/sectorAdmin/SchoolDetailModal.tsx**
```typescript
interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  onDataEdit: (categoryId: string) => void;
}

// Features:
// - School overview stats
// - Category-wise completion status
// - Recent activity timeline
// - Pending approvals list
// - Quick action buttons
```

### **Phase 3: Hooks və State Management (2 saat)**

#### 📄 **3.1. src/hooks/sectorAdmin/useSchoolManagement.ts**
```typescript
interface UseSchoolManagementProps {
  sectorId: string;
  filters: FilterOptions;
}

interface UseSchoolManagementReturn {
  schools: SchoolStats[];
  sectorStats: SectorStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  exportData: (format: 'csv' | 'xlsx') => Promise<void>;
}

interface SectorStats {
  totalSchools: number;
  completedSchools: number;
  averageCompletionRate: number;
  overdueSchools: number;
  pendingApprovals: number;
  lastUpdated: Date;
}

// Features:
// - Real-time data fetching
// - Filtering logic
// - Caching optimization
// - Error handling
// - Auto-refresh functionality
```

#### 📄 **3.2. src/hooks/sectorAdmin/useBulkOperations.ts**
```typescript
interface UseBulkOperationsProps {
  selectedSchools: string[];
}

interface UseBulkOperationsReturn {
  sendBulkNotification: (notification: NotificationForm) => Promise<void>;
  performBulkDataEntry: (data: BulkDataEntryForm) => Promise<void>;
  exportBulkData: (format: 'csv' | 'xlsx') => Promise<void>;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

interface BulkDataEntryForm {
  categoryId: string;
  columnData: Record<string, any>;
  applyToSchools: string[];
  notes?: string;
}

// Features:
// - Progress tracking
// - Batch processing
// - Error aggregation
// - Rollback functionality
```

#### 📄 **3.3. src/hooks/sectorAdmin/useSchoolDataEdit.ts**
```typescript
interface UseSchoolDataEditProps {
  schoolId: string;
  categoryId?: string;
}

interface UseSchoolDataEditReturn {
  formData: Record<string, any>;
  columns: Column[];
  validationErrors: Record<string, string>;
  isDirty: boolean;
  isSubmitting: boolean;
  updateField: (columnId: string, value: any) => void;
  saveAsDraft: () => Promise<void>;
  submitForApproval: () => Promise<void>;
  reset: () => void;
}

// Features:
// - Form state management
// - Real-time validation
// - Auto-save functionality
// - Conflict detection
```

### **Phase 4: API və Backend Integration (1 saat)**

#### 📄 **4.1. src/services/sectorAdminService.ts**
```typescript
export class SectorAdminService {
  static async getSchoolStats(sectorId: string, filters: FilterOptions): Promise<SchoolStats[]>;
  static async getSectorOverview(sectorId: string): Promise<SectorStats>;
  static async updateSchoolData(schoolId: string, data: DataEntryForm): Promise<void>;
  static async sendNotification(notification: NotificationForm): Promise<void>;
  static async exportSchoolData(schoolIds: string[], format: 'csv' | 'xlsx'): Promise<Blob>;
  static async getNotificationTemplates(): Promise<NotificationTemplate[]>;
}

// Supabase Edge Functions:
// - get-sector-school-stats
// - update-school-data-by-admin
// - send-bulk-notification
// - export-school-data
```

#### 📄 **4.2. supabase/functions/get-sector-school-stats/index.ts**
```typescript
interface RequestBody {
  sectorId: string;
  filters: FilterOptions;
}

interface ResponseData {
  schools: SchoolStats[];
  sectorStats: SectorStats;
}

// SQL Query optimization:
// - Join schools, data_entries, categories
// - Calculate completion rates
// - Apply filters efficiently
// - Use indexes for performance
```

### **Phase 5: DataEntry.tsx İnteqrasiyası (1 saat)**

#### 📄 **5.1. src/pages/DataEntry.tsx (UPDATE)**
```typescript
// Yeni tab əlavə etmək:
<TabsTrigger value="management">
  <Users className="mr-2 h-4 w-4" />
  {t('schoolManagement')}
</TabsTrigger>

// Management tab content:
<TabsContent value="management">
  <SchoolManagementDashboard 
    sectorId={user?.sector_id || ''}
    currentUser={user}
  />
</TabsContent>

// Import statements:
import { SchoolManagementDashboard } from '@/components/sectorAdmin/SchoolManagementDashboard';
import { Users } from 'lucide-react';
```

### **Phase 6: Translations və Styling (1 saat)**

#### 📄 **6.1. src/translations/az/sectorAdmin.ts (YENİ FAYL)**
```typescript
export const sectorAdminTranslations = {
  // Dashboard
  schoolManagement: 'Məktəb İdarəetməsi',
  sectorOverview: 'Sektor İcmalı',
  totalSchools: 'Ümumi Məktəblər',
  completedSchools: 'Tamamlanmış Məktəblər', 
  averageCompletion: 'Ortalama Tamamlama',
  overdueSchools: 'Gecikmə olan Məktəblər',
  
  // Table Headers
  schoolName: 'Məktəb Adı',
  completionRate: 'Tamamlama Faizi',
  lastActivity: 'Son Aktivlik',
  status: 'Status',
  actions: 'Əməliyyatlar',
  
  // Status Values
  completed: 'Tamamlandı',
  pending: 'Gözləmədə',
  overdue: 'Gecikmiş',
  notStarted: 'Başlanmayıb',
  
  // Actions
  editData: 'Məlumat Redaktə Et',
  sendNotification: 'Xəbərdarlıq Göndər',
  viewDetails: 'Detallar',
  
  // Bulk Operations
  bulkOperations: 'Toplu Əməliyyatlar',
  selectedSchools: 'Seçilmiş Məktəblər',
  bulkNotification: 'Toplu Bildiriş',
  bulkDataEntry: 'Toplu Məlumat Daxil Etmə',
  bulkExport: 'Toplu İxrac',
  clearSelection: 'Seçimi Təmizlə',
  
  // Filters
  filterSchools: 'Məktəbləri Filterlə',
  searchSchools: 'Məktəb Axtarın...',
  filterByCategory: 'Kateqoriyaya görə',
  completionRange: 'Tamamlama Aralığı',
  lastActivityFilter: 'Son Aktivlik',
  statusFilter: 'Status',
  resetFilters: 'Filterləri Sıfırla',
  
  // Modals
  editSchoolData: 'Məktəb Məlumatlarını Redaktə Et',
  selectCategory: 'Kateqoriya Seçin',
  saveAsDraft: 'Layihə Kimi Saxla',
  submitForApproval: 'Təsdiq üçün Göndər',
  
  // Notifications
  notificationSent: 'Bildiriş göndərildi',
  dataUpdated: 'Məlumatlar yeniləndi',
  operationCompleted: 'Əməliyyat tamamlandı',
  
  // Errors
  noSchoolsSelected: 'Heç bir məktəb seçilməyib',
  operationFailed: 'Əməliyyat uğursuz oldu',
  loadingError: 'Məlumat yüklənərkən xəta baş verdi'
};
```

#### 📄 **6.2. src/translations/az/dataEntry.ts (UPDATE)**
```typescript
// Mövcud faylda əlavə etmək:
export const dataEntryTranslations = {
  // ... mövcud translations ...
  
  // Yeni açarlar:
  schoolManagement: 'Məktəb İdarəetməsi',
  manageSchoolData: 'Məktəb Məlumatlarını İdarə Et',
  // ... digər lazımi açarlar
};
```

#### 📄 **6.3. src/styles/components/sectorAdmin.css (YENİ FAYL)**
```css
/* SectorAdmin specific styles */
.school-management-dashboard {
  @apply space-y-6;
}

.sector-stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
}

.school-data-table {
  @apply border rounded-lg overflow-hidden;
}

.completion-progress {
  @apply h-2 bg-gray-200 rounded-full overflow-hidden;
}

.completion-progress-bar {
  @apply h-full transition-all duration-300;
}

.completion-progress-bar.low {
  @apply bg-red-500;
}

.completion-progress-bar.medium {
  @apply bg-yellow-500;
}

.completion-progress-bar.high {
  @apply bg-green-500;
}

.bulk-operations-panel {
  @apply sticky top-0 bg-white border-b p-4 z-10;
}

.school-filter-panel {
  @apply space-y-4 p-4 border rounded-lg bg-gray-50;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .school-data-table {
    @apply text-sm;
  }
  
  .sector-stats-grid {
    @apply grid-cols-2;
  }
}
```

---

## 🗃️ **DATABASE SCHEMA UPDATES**

### **Yeni cədvəllər və ya sütunlar:**

```sql
-- notifications table enhancement
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS 
template_id UUID REFERENCES notification_templates(id);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS 
delivery_method TEXT DEFAULT 'system';

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS 
scheduled_for TIMESTAMP WITH TIME ZONE;

-- notification_templates table (yeni)
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- school_management_logs table (yeni)
CREATE TABLE IF NOT EXISTS school_management_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Performance indexes:**
```sql
-- Optimize school completion queries
CREATE INDEX IF NOT EXISTS idx_data_entries_school_status 
ON data_entries(school_id, status);

CREATE INDEX IF NOT EXISTS idx_schools_sector_completion 
ON schools(sector_id, completion_rate);

CREATE INDEX IF NOT EXISTS idx_notifications_scheduled 
ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
```

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests:**

#### 📄 **src/__tests__/sectorAdmin/SchoolManagementDashboard.test.tsx**
```typescript
describe('SchoolManagementDashboard', () => {
  it('should display sector statistics correctly');
  it('should handle school filtering');
  it('should support bulk operations');
  it('should handle error states gracefully');
  it('should be responsive on mobile devices');
});
```

#### 📄 **src/__tests__/sectorAdmin/useSchoolManagement.test.ts**
```typescript
describe('useSchoolManagement hook', () => {
  it('should fetch and filter school data');
  it('should calculate completion rates correctly');
  it('should handle real-time updates');
  it('should cache data efficiently');
});
```

### **Integration Tests:**

#### 📄 **src/__tests__/sectorAdmin/integration/BulkOperations.test.tsx**
```typescript
describe('Bulk Operations Integration', () => {
  it('should send notifications to multiple schools');
  it('should perform bulk data entry');
  it('should export data correctly');
  it('should handle partial failures');
});
```

### **E2E Tests:**

#### 📄 **cypress/e2e/sectorAdmin/schoolManagement.cy.ts**
```typescript
describe('SectorAdmin School Management', () => {
  it('should complete full workflow: filter → select → bulk edit → notify');
  it('should handle pagination with large school lists');
  it('should work correctly on mobile devices');
});
```

---

## 📅 **TIMELINE VƏ MİLESTONES**

### **Gün 1 (6 İyun 2025) - Components Foundation**
- [ ] **09:00-13:00**: Core components yaratmaq
  - [ ] SchoolManagementDashboard.tsx ✅
  - [ ] SchoolDataTable.tsx ✅
  - [ ] BulkOperationsPanel.tsx ✅
  - [ ] SchoolFilterPanel.tsx ✅

### **Gün 1 (6 İyun 2025) - Modals və Forms**
- [ ] **14:00-17:00**: Modal components
  - [ ] SchoolDataEditModal.tsx ✅
  - [ ] NotificationModal.tsx ✅
  - [ ] SchoolDetailModal.tsx ✅

### **Gün 2 (7 İyun 2025) - Logic və Integration**
- [ ] **09:00-11:00**: Hooks development
  - [ ] useSchoolManagement.ts ✅
  - [ ] useBulkOperations.ts ✅
  - [ ] useSchoolDataEdit.ts ✅

- [ ] **11:00-12:00**: DataEntry.tsx integration
  - [ ] Yeni tab əlavə etmək ✅
  - [ ] Import və render logic ✅

- [ ] **14:00-15:00**: Translations və Styling
  - [ ] sectorAdmin.ts translations ✅
  - [ ] CSS updates ✅
  - [ ] Mobile optimizations ✅

### **Gün 2 (7 İyun 2025) - Testing və Polish**
- [ ] **15:00-17:00**: Testing və debugging
  - [ ] Unit tests yazılması ✅
  - [ ] Integration testing ✅
  - [ ] Bug fixes ✅
  - [ ] Performance optimization ✅

---

## ⚠️ **RISK MANAGEMENT**

### **Potential Risks:**

1. **Performance Risk**: Böyük məktəb siyahıları (500+ məktəb)
   - **Mitigation**: Virtual scrolling, pagination, caching

2. **UX Complexity**: Çox kompleks interfeys 
   - **Mitigation**: Progressive disclosure, guided tours

3. **Data Consistency**: Real-time updates conflict-ləri
   - **Mitigation**: Optimistic updates, conflict resolution

4. **Mobile Performance**: Kiçik ekranlarda usability
   - **Mitigation**: Mobile-first design, touch optimization

### **Rollback Plan:**
- Component-level feature flags
- Database migrations reversible
- Old functionality parallel qalacaq

---

## 🎯 **SUCCESS CRITERIA**

### **Performance Metrics:**
- [ ] School list loading: <2 saniyə (500 məktəb üçün)
- [ ] Filter operations: <500ms
- [ ] Bulk operations: <5 saniyə (10 məktəb üçün)
- [ ] Mobile response time: <3 saniyə

### **User Satisfaction:**
- [ ] Task completion time: 60% azalma
- [ ] User error rate: <5%
- [ ] Mobile usability score: >4.0/5

### **Technical Quality:**
- [ ] Test coverage: >85%
- [ ] TypeScript compliance: 100%
- [ ] Accessibility: WCAG 2.1 AA
- [ ] Performance budget: <500KB bundle size

---

## 📋 **NEXT STEPS**

### **Immediate Actions (Bugün):**
1. Plan təsdiq etmə
2. Development environment hazırlığı
3. Component skeleton yaratmaq
4. Git branch yaratma: `feature/sector-admin-school-management`

### **Daily Standup Agenda:**
- Completed tasks review
- Blocker identification
- Next day planning
- Code review assignments

---

**🏁 FINAL TARGET**: 2 gün ərzində tam funksional SectorAdmin School Management Panel!

**⚡ Status**: HAZIR - Implementation başlaya bilər! 🚀

---

*Plan yaradılması: 6 İyun 2025, 07:45*  
*Növbəti update: 6 İyun 2025, 13:00 (İlk milestone sonrası)*