# İnfoLine Data Management Integration Plan

## 📋 Layihə Xülasəsi

**Məqsəd:** Approval və SectorAdmin DataEntry proseslərini birləşdirərək vahid, səliqəli və effektiv Data Management səhifəsi yaratmaq.

**Tarix:** 24 İyun 2025  
**Status:** 🚀 Başladı  
**Prioritet:** Yüksək  

## 🎯 Əsas Tələblər

- [ ] Vahid səhifə (RegionAdmin və SectorAdmin üçün)
- [ ] Kateqoriya → Sütun seçimi
- [ ] Məktəb data grid (view/edit/approve/reject)
- [ ] Boş hissələrə data daxil etmə imkanı
- [ ] Təsdiq et/Rədd et buttonları
- [ ] Mobile responsive dizayn
- [ ] Role-based icazələr
- [ ] Performance optimization

## 📊 Mövcud Vəziyyət Analizi

### ✅ İşləyən Komponentlər
- [x] `pages/Approval.tsx` - ColumnBasedApprovalManager
- [x] `pages/SectorDataEntry.tsx` - UnifiedSectorDataEntry  
- [x] `components/approval/column-based/ColumnBasedApprovalManager.tsx`
- [x] `components/dataEntry/unified/UnifiedSectorDataEntry.tsx`
- [x] `hooks/approval/useColumnBasedApproval.ts`
- [x] `hooks/dataEntry/sector/useSchoolDataForColumn.ts`

### ❌ Təkrarçılıq Problemləri
- [x] Kateqoriya/sütun seçimi dublicate edilir
- [x] Eyni data loading hookları
- [x] UI pattern təkrarları
- [x] Navigation və workflow logikası dublicate

## 🏗️ Arxitektura Dizaynı

```
DataManagement Page
├── Header (breadcrumb, title, actions)
├── Progress Indicator
├── CategorySelector (step 1)
├── ColumnSelector (step 2) 
├── SchoolDataGrid (step 3)
│   ├── Data Entry Fields
│   ├── Approval Actions
│   └── Bulk Operations
└── Footer (navigation, stats)
```

## 📝 Detallı İmplementasiya Planı

### 🔥 PHASE 1: Foundation (Təməl Qurma)
**Tarix:** 24 İyun 2025  
**Status:** 🚀 İcra olunur  

#### STEP 1.1: Ana Səhifə Yaratmaq
**Fayl:** `src/pages/DataManagement.tsx`
- [ ] Əsas səhifə strukturu
- [ ] Role-based access control
- [ ] Header və navigation
- [ ] Progress indicator
- [ ] Mobile responsive layout

#### STEP 1.2: Ana Komponent Yaratmaq  
**Fayl:** `src/components/dataManagement/UnifiedDataManagement.tsx`
- [ ] Workflow state management
- [ ] Step navigation logic
- [ ] Role detection və permissions
- [ ] Loading states
- [ ] Error handling

#### STEP 1.3: Unified Hook Yaratmaq
**Fayl:** `src/hooks/dataManagement/useDataManagement.ts`
- [ ] Combined data fetching
- [ ] Category/column selection logic
- [ ] School data management
- [ ] Save/approve/reject actions
- [ ] Optimistic updates
- [ ] Error handling

### 🏗️ PHASE 2: UI Components (İnterfeys Komponentləri)
**Tarix:** 24 İyun 2025  
**Status:** ⏳ Gözləyir

#### STEP 2.1: CategorySelector Komponenti
**Fayl:** `src/components/dataManagement/components/CategorySelector.tsx`
- [ ] Category grid layout
- [ ] Assignment badges (sectors/all)
- [ ] Completion rate indicators
- [ ] Loading states
- [ ] Empty states
- [ ] Mobile responsive cards

#### STEP 2.2: ColumnSelector Komponenti
**Fayl:** `src/components/dataManagement/components/ColumnSelector.tsx`
- [ ] Column list layout
- [ ] Column type indicators
- [ ] Required field badges
- [ ] Help text display
- [ ] Filtering və search
- [ ] Back navigation

#### STEP 2.3: SchoolDataGrid Komponenti
**Fayl:** `src/components/dataManagement/components/SchoolDataGrid.tsx`
- [ ] Data table layout
- [ ] Inline edit functionality
- [ ] Status indicators
- [ ] Bulk selection
- [ ] Approval actions
- [ ] Pagination
- [ ] Export functionality

#### STEP 2.4: DataActions Komponenti
**Fayl:** `src/components/dataManagement/components/DataActions.tsx`
- [ ] Individual save/approve/reject
- [ ] Bulk operations
- [ ] Confirmation dialogs
- [ ] Loading states
- [ ] Success/error feedback

### 🔧 PHASE 3: Integration (İnteqrasiya)
**Tarix:** 24 İyun 2025  
**Status:** ⏳ Gözləyir

#### STEP 3.1: Routing Update
**Fayl:** `src/routes/AppRoutes.tsx`
- [ ] Yeni route əlavə etmək: `/data-management`
- [ ] Role-based route guards
- [ ] Redirect köhnə routes
- [ ] Breadcrumb integration

#### STEP 3.2: Navigation Update
**Fayl:** `src/components/layout/Sidebar.tsx`
- [ ] Yeni menu item: "Data İdarəetməsi"
- [ ] Role-based visibility
- [ ] Active state handling
- [ ] Remove old menu items

#### STEP 3.3: Translation Update
**Fayl:** `src/translations/az/navigation.ts`
- [ ] Yeni translation keys
- [ ] Menu item translations
- [ ] Error message translations
- [ ] Action button translations

### 🧪 PHASE 4: Testing & Optimization (Test və Optimallaşdırma)
**Tarix:** 25 İyun 2025  
**Status:** ⏳ Gözləyir

#### STEP 4.1: Functionality Testing
- [ ] RegionAdmin role testing
- [ ] SectorAdmin role testing
- [ ] Data entry workflow
- [ ] Approval workflow
- [ ] Error scenarios
- [ ] Mobile responsiveness

#### STEP 4.2: Performance Optimization
- [ ] Data loading optimization
- [ ] Component memoization
- [ ] Lazy loading
- [ ] Cache strategy
- [ ] Bundle size analysis

#### STEP 4.3: User Experience Testing
- [ ] Navigation flow testing
- [ ] Form validation testing
- [ ] Error handling testing
- [ ] Mobile usability testing
- [ ] Accessibility testing

### 🗑️ PHASE 5: Cleanup (Təmizlənmə)
**Tarix:** 25 İyun 2025  
**Status:** ⏳ Gözləyir

#### STEP 5.1: Remove Old Pages
- [ ] Delete `src/pages/Approval.tsx`
- [ ] Delete `src/pages/SectorDataEntry.tsx`
- [ ] Update route redirects

#### STEP 5.2: Remove Old Components
- [ ] Delete `src/components/approval/` directory
- [ ] Delete `src/components/dataEntry/unified/` directory
- [ ] Clean up imports

#### STEP 5.3: Remove Old Hooks & Services
- [ ] Delete `src/hooks/approval/` directory
- [ ] Delete `src/services/approval/` directory
- [ ] Clean up unused dependencies

## 📁 Fayl Strukturu

### 🆕 Yaradılacaq Fayllar

```
src/
├── pages/
│   └── DataManagement.tsx                           # ✅ Status: Not Started
├── components/
│   └── dataManagement/                              # 📁 New Directory
│       ├── UnifiedDataManagement.tsx               # ✅ Status: Not Started
│       ├── components/                              # 📁 New Directory
│       │   ├── CategorySelector.tsx                # ✅ Status: Not Started
│       │   ├── ColumnSelector.tsx                  # ✅ Status: Not Started
│       │   ├── SchoolDataGrid.tsx                  # ✅ Status: Not Started
│       │   ├── DataActions.tsx                     # ✅ Status: Not Started
│       │   └── index.ts                            # ✅ Status: Not Started
│       └── index.ts                                # ✅ Status: Not Started
├── hooks/
│   └── dataManagement/                              # 📁 New Directory
│       ├── useDataManagement.ts                    # ✅ Status: Not Started
│       ├── useCategorySelector.ts                  # ✅ Status: Not Started
│       ├── useSchoolData.ts                        # ✅ Status: Not Started
│       └── index.ts                                # ✅ Status: Not Started
├── services/
│   └── dataManagement/                              # 📁 New Directory
│       ├── dataManagementService.ts                # ✅ Status: Not Started
│       └── index.ts                                # ✅ Status: Not Started
└── types/
    └── dataManagement.ts                            # ✅ Status: Not Started
```

### 🗑️ Silinəcək Fayllar

```
src/
├── pages/
│   ├── Approval.tsx                                 # 🗑️ Delete in Phase 5
│   └── SectorDataEntry.tsx                          # 🗑️ Delete in Phase 5
├── components/
│   ├── approval/                                    # 🗑️ Entire Directory
│   │   ├── ApprovalManager.tsx                      # 🗑️ Delete in Phase 5
│   │   ├── column-based/                            # 🗑️ Entire Directory
│   │   │   ├── ColumnBasedApprovalManager.tsx       # 🗑️ Delete in Phase 5
│   │   │   ├── ColumnSelector.tsx                   # 🗑️ Delete in Phase 5
│   │   │   ├── SchoolDataTable.tsx                  # 🗑️ Delete in Phase 5
│   │   │   └── ApprovalActions.tsx                  # 🗑️ Delete in Phase 5
│   │   └── enhanced/                                # 🗑️ Entire Directory
│   └── dataEntry/
│       └── unified/                                 # 🗑️ Entire Directory
│           └── UnifiedSectorDataEntry.tsx           # 🗑️ Delete in Phase 5
├── hooks/
│   └── approval/                                    # 🗑️ Entire Directory
│       ├── useColumnBasedApproval.ts                # 🗑️ Delete in Phase 5
│       ├── useEnhancedApprovalData.ts               # 🗑️ Delete in Phase 5
│       ├── useApprovalData.ts                       # 🗑️ Delete in Phase 5
│       └── useBulkOperations.ts                     # 🗑️ Delete in Phase 5
└── services/
    └── approval/                                    # 🗑️ Entire Directory
        ├── columnBasedApprovalService.ts            # 🗑️ Delete in Phase 5
        ├── enhancedApprovalService.ts               # 🗑️ Delete in Phase 5
        └── bulkOperationService.ts                  # 🗑️ Delete in Phase 5
```

### 🔄 Dəyişdiriləcək Fayllar

```
src/
├── routes/AppRoutes.tsx                             # 🔄 Update: Add new route
├── components/layout/Sidebar.tsx                    # 🔄 Update: Menu items
├── components/layout/unified/UnifiedNavigation.tsx  # 🔄 Update: Navigation links
├── translations/az/navigation.ts                    # 🔄 Update: Add translations
├── translations/az/dataManagement.ts               # 🔄 New: Data management translations
└── lib/constants.ts                                 # 🔄 Update: Add route constants
```

## 🛠️ Technical Implementation Details

### Komponent Hierarchy
```typescript
DataManagement
├── useDataManagement() // Main hook
├── CategorySelector
│   └── useCategorySelector()
├── ColumnSelector  
│   └── useColumnSelector()
└── SchoolDataGrid
    ├── useSchoolData()
    └── DataActions
        └── useDataActions()
```

### State Management Strategy
```typescript
interface DataManagementState {
  currentStep: 'category' | 'column' | 'data';
  selectedCategory: Category | null;
  selectedColumn: Column | null;
  schoolData: SchoolData[];
  loading: {
    categories: boolean;
    columns: boolean;
    schoolData: boolean;
    saving: boolean;
  };
  error: string | null;
  permissions: UserPermissions;
}
```

### API Integration Points
- `GET /api/categories` - Category listing
- `GET /api/categories/:id/columns` - Columns for category
- `GET /api/schools/:sectorId/data/:columnId` - School data for column
- `POST /api/data-entries` - Save data entry
- `PUT /api/data-entries/:id/approve` - Approve entry
- `PUT /api/data-entries/:id/reject` - Reject entry

## 📊 Progress Tracking

### Overall Progress: 0% Complete

| Phase | Progress | Start Date | End Date | Status |
|-------|----------|------------|----------|--------|
| Phase 1: Foundation | 0% | 24/06/2025 | 24/06/2025 | 🚀 In Progress |
| Phase 2: UI Components | 0% | 24/06/2025 | 24/06/2025 | ⏳ Waiting |
| Phase 3: Integration | 0% | 24/06/2025 | 24/06/2025 | ⏳ Waiting |
| Phase 4: Testing | 0% | 25/06/2025 | 25/06/2025 | ⏳ Waiting |
| Phase 5: Cleanup | 0% | 25/06/2025 | 25/06/2025 | ⏳ Waiting |

### Step-by-Step Progress

#### Phase 1: Foundation
- [ ] STEP 1.1: Ana Səhifə (`DataManagement.tsx`) - 0%
- [ ] STEP 1.2: Ana Komponent (`UnifiedDataManagement.tsx`) - 0%  
- [ ] STEP 1.3: Unified Hook (`useDataManagement.ts`) - 0%

#### Phase 2: UI Components  
- [ ] STEP 2.1: CategorySelector - 0%
- [ ] STEP 2.2: ColumnSelector - 0%
- [ ] STEP 2.3: SchoolDataGrid - 0%
- [ ] STEP 2.4: DataActions - 0%

#### Phase 3: Integration
- [ ] STEP 3.1: Routing Update - 0%
- [ ] STEP 3.2: Navigation Update - 0%
- [ ] STEP 3.3: Translation Update - 0%

#### Phase 4: Testing & Optimization
- [ ] STEP 4.1: Functionality Testing - 0%
- [ ] STEP 4.2: Performance Optimization - 0%
- [ ] STEP 4.3: User Experience Testing - 0%

#### Phase 5: Cleanup
- [ ] STEP 5.1: Remove Old Pages - 0%
- [ ] STEP 5.2: Remove Old Components - 0%
- [ ] STEP 5.3: Remove Old Hooks & Services - 0%

## ⚠️ Risk Assessment

### High Risk Items
- [ ] **RLS Permissions** - RegionAdmin/SectorAdmin icazələri düzgün işləməlidir
- [ ] **Data Consistency** - Mövcud data ilə uyğunluq təmin edilməlidir
- [ ] **Performance** - Böyük data setləri üçün optimize edilməlidir

### Medium Risk Items  
- [ ] **Mobile Responsiveness** - Kompleks table struktur mobil cihazlarda çətin ola bilər
- [ ] **User Experience** - Workflow transitioni smooth olmalıdır
- [ ] **Browser Compatibility** - Bütün target browserlərdə test edilməlidir

### Low Risk Items
- [ ] **Translation** - Yeni keys əlavə edilməsi sadədir
- [ ] **Routing** - Sadə route dəyişiklikləridir
- [ ] **Navigation** - Əsas menu update-ləridir

## 🎯 Success Criteria

### Functionality Requirements
- [ ] **Category Selection** - Kateqoriyalar rol-əsaslı şəkildə göstərilir
- [ ] **Column Selection** - Seçilən kateqoriyaya aid sütunlar göstərilir  
- [ ] **Data Entry** - İnline edit və ya modal vasitəsilə data daxil edilir
- [ ] **Approval Actions** - Təsdiq/rədd actionları işləyir
- [ ] **Bulk Operations** - Toplu əməliyyatlar mümkündür
- [ ] **Role-based Access** - RegionAdmin və SectorAdmin səlahiyyətləri düzgündür

### Performance Requirements
- [ ] **Page Load Time** - 2 saniyədən az
- [ ] **Data Loading** - Progressive loading və skeleton states
- [ ] **Table Performance** - 1000+ sətir üçün virtualization
- [ ] **Mobile Performance** - Smooth scrolling və responsive

### User Experience Requirements
- [ ] **Intuitive Navigation** - Clear step-by-step workflow
- [ ] **Error Handling** - User-friendly error messages
- [ ] **Feedback** - Success/error toasts və loading states
- [ ] **Accessibility** - WCAG 2.1 AA compliance

## 📞 Support & Maintenance

### Code Review Checklist
- [ ] Code quality və standards
- [ ] Performance optimization
- [ ] Security best practices
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Test coverage

### Documentation Requirements
- [ ] Component documentation
- [ ] API documentation  
- [ ] User guide update
- [ ] Migration guide

### Deployment Checklist
- [ ] Environment variables
- [ ] Database migrations
- [ ] Feature flags
- [ ] Rollback plan
- [ ] Monitoring setup

---

**Son Yenilənmə:** 24 İyun 2025  
**Növbəti Review:** 25 İyun 2025  
**Layihə Meneceri:** Development Team  
**Status:** 🚀 Aktiv İnkişaf