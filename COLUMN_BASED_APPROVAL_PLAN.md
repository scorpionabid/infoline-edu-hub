# İnfoLine: Column-Based Approval System Implementation Plan

## **Layihə Məqsədi**

Sektoradmin üçün approval prosesini sektoradmin data entry kimi edək:
- Sütun seçilir
- Aşağıda həmin sütuna aid məktəblərin məlumatları görünür  
- Hər məktəb qarşısında "Təsdiq et" və "İnkar et" düymələri

## **Mövcud Vəziyyətin Analizi**

### ✅ **Hazırda Mövcud Olanlar:**
- **SectorDataEntry** səhifəsi mövcuddur (`pages/SectorDataEntry.tsx`)
- **Approval** səhifəsi mövcuddur və **EnhancedApprovalManager** istifadə edir
- **ColumnDataTable** komponenti mövcuddur və sütun-əsaslı data görünüş təmin edir
- Mövcud approval sistemi kart-əsaslı interfeys istifadə edir
- **UnifiedSectorDataEntry** komponenti struktur mövcuddur lakin tam inkişaf etdirilməyib

### ❌ **Çatışmayanlar:**
- Sütun-əsaslı approval interface yoxdur
- Column-based approval service və hook-lar yoxdur
- Sektoradmin üçün xüsusi approval route yoxdur

## **İmplementasiya Planı**

### **1. Faza: Type Definitions və Service Layer**
#### ✅ **Tamamlanmış:**
- `src/types/columnBasedApproval.ts` - tam yeni type definitions
- `src/services/approval/columnBasedApprovalService.ts` - backend əməliyyatları
- `src/hooks/approval/useColumnBasedApproval.ts` - state management hook

### **2. Faza: UI Komponentləri** 
#### ✅ **Tamamlanmış:**
- `src/components/approval/column-based/ColumnSelector.tsx` - sütun seçimi
- `src/components/approval/column-based/SchoolDataTable.tsx` - məktəb məlumatları cədvəli
- `src/components/approval/column-based/ApprovalActions.tsx` - təsdiq/rədd düymələri
- `src/components/approval/column-based/ColumnBasedApprovalManager.tsx` - əsas konteyner
- `src/components/approval/column-based/index.ts` - export fayl

### **3. Faza: Pages və Routing**
#### ✅ **Tamamlanmış:**
- `src/pages/ColumnBasedApproval.tsx` - yeni səhifə yaradıldı
- `src/routes/AppRoutes.tsx` - yeni route əlavə edildi
- `src/pages/Approval.tsx` - mode switcher əlavə edildi
- `src/hooks/approval/index.ts` - export əlavə edildi

### **4. Faza: Backend Integration**
#### ⏳ **Planlaşdırılmış:**
- SQL stored procedures yaradılması:
  - `get_categories_with_column_counts_for_approval()`
  - `get_school_data_by_column_for_approval()`
  - `get_column_approval_stats()`
  - `approve_school_column_entry()`
  - `reject_school_column_entry()`
  - `bulk_approve_column_entries()`
  - `bulk_reject_column_entries()`

### **5. Faza: Testing və Optimization**
#### ⏳ **Planlaşdırılmış:**
- Unit testlər yazılması
- Integration testlər
- Performance optimallaşdırması
- User acceptance testing

## **Fayl Strukturu**

### **Yaradılacaq Yeni Fayllar:**
```
src/
├── components/approval/column-based/
│   ├── ColumnBasedApprovalManager.tsx     [YENİ]
│   ├── ColumnSelector.tsx                 [✅ YARADILDI]
│   ├── SchoolDataTable.tsx                [✅ YARADILDI]  
│   ├── ApprovalActions.tsx                [🔄 HAZIRLANIR]
│   └── index.ts                           [YENİ]
├── services/approval/
│   └── columnBasedApprovalService.ts      [✅ YARADILDI]
├── hooks/approval/
│   └── useColumnBasedApproval.ts          [✅ YARADILDI]
├── types/
│   └── columnBasedApproval.ts             [✅ YARADILDI]
├── pages/
│   └── ColumnBasedApproval.tsx            [YENİ]
└── translations/az/
    └── columnBasedApproval.ts             [YENİ]
```

### **Dəyişdiriləcək Mövcud Fayllar:**
```
src/
├── pages/Approval.tsx                     [DƏYIŞƏK - mode switcher]
├── routes/AppRoutes.tsx                   [DƏYIŞƏK - yeni route]
├── hooks/approval/index.ts                [DƏYIŞƏK - export əlavə et]
└── components/approval/index.ts           [DƏYIŞƏK - export əlavə et]
```

## **Backend Tələbləri (SQL Functions)**

Aşağıdakı stored procedures yaradılmalıdır:

### **1. Categories with Column Counts**
```sql
CREATE OR REPLACE FUNCTION get_categories_with_column_counts_for_approval()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  assignment text,
  column_count integer,
  pending_count integer,
  status text
);
```

### **2. School Data by Column**
```sql
CREATE OR REPLACE FUNCTION get_school_data_by_column_for_approval(
  p_column_id uuid,
  p_sector_id uuid DEFAULT NULL,
  p_region_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_search_term text DEFAULT NULL,
  p_show_empty boolean DEFAULT false
)
RETURNS TABLE (
  school_id uuid,
  school_name text,
  sector_id uuid,
  sector_name text,
  region_id uuid,
  region_name text,
  column_id uuid,
  value text,
  status text,
  submitted_at timestamp,
  submitted_by uuid,
  approved_at timestamp,
  approved_by uuid,
  rejected_at timestamp,
  rejected_by uuid,
  rejection_reason text
);
```

### **3. Column Approval Stats**
```sql
CREATE OR REPLACE FUNCTION get_column_approval_stats(
  p_column_id uuid,
  p_sector_id uuid DEFAULT NULL,
  p_region_id uuid DEFAULT NULL
)
RETURNS TABLE (
  total_schools integer,
  filled_count integer,
  pending_count integer,
  approved_count integer,
  rejected_count integer,
  empty_count integer,
  completion_rate integer
);
```

### **4. Individual Approval Functions**
```sql
CREATE OR REPLACE FUNCTION approve_school_column_entry(
  p_school_id uuid,
  p_column_id uuid,
  p_comment text DEFAULT NULL
)
RETURNS boolean;

CREATE OR REPLACE FUNCTION reject_school_column_entry(
  p_school_id uuid,
  p_column_id uuid,
  p_reason text,
  p_comment text DEFAULT NULL
)
RETURNS boolean;
```

### **5. Bulk Approval Functions**
```sql
CREATE OR REPLACE FUNCTION bulk_approve_column_entries(
  p_school_ids uuid[],
  p_column_id uuid,
  p_comment text DEFAULT NULL
)
RETURNS TABLE (
  processed_count integer,
  success_count integer,
  error_count integer,
  errors jsonb
);

CREATE OR REPLACE FUNCTION bulk_reject_column_entries(
  p_school_ids uuid[],
  p_column_id uuid,
  p_reason text,
  p_comment text DEFAULT NULL
)
RETURNS TABLE (
  processed_count integer,
  success_count integer,
  error_count integer,
  errors jsonb
);
```

## **Silinəcək və Təmizlənəcək Elementlər**

### **İmplementasiyadan Sonra Silinəcək Fayllar:**
```
src/components/approval/enhanced/
├── BulkReviewPanel.tsx                    [SİLİNƏCƏK - təkrarçılıq]
├── ColumnDataTable.tsx                    [SİLİNƏCƏK - yeni versiya əvəz edəcək]
└── DataReviewDialog.tsx                   [QORUMAQ - hələ lazım ola bilər]

src/hooks/approval/
├── useApprovalData.ts                     [SİLİNƏCƏK - köhnə sistem]
├── useBulkOperations.ts                   [SİLİNƏCƏK - yeni hookda birləşdirildi]
└── useDataReview.ts                       [SİLİNƏCƏK - təkrarçılıq]

src/services/approval/
├── bulkOperationService.ts                [SİLİNƏCƏK - təkrarçılıq]
└── dataReviewService.ts                   [SİLİNƏCƏK - təkrarçılıq]
```

### **Refactor Ediləcək Fayllar:**
```
src/components/approval/ApprovalManager.tsx [REFACTOR - sadələşdirmək]
src/pages/Approval.tsx                      [REFACTOR - mode switcher əlavə et]
src/hooks/approval/useEnhancedApprovalData.ts [REFACTOR - optimallaşdır]
```

### **Köhnə və İstifadə Olunmayan Komponentlər:**
```
src/components/dataEntry/legacy/           [TAMAMILƏ SİL]
src/components/dataEntry/proxy-removed/    [TAMAMILƏ SİL]
src/components/dataEntry/workflow-backup.removed/ [TAMAMILƏ SİL]
```

## **Progress Tracking**

### **Tamamlanma Vəziyyəti:**
- **Types & Interfaces:** ✅ 100% (4/4)
- **Service Layer:** ✅ 100% (1/1) 
- **Hook Development:** ✅ 100% (1/1)
- **UI Components:** ✅ 100% (5/5)
- **Pages & Routing:** ✅ 100% (4/4)
- **Backend Integration:** ⏳ 0% (0/7)
- **Testing:** ⏳ 0% (0/3)
- **Documentation:** ✅ 90% (5/5)

### **Ümumi Progress:** 🔄 **75%** (20/27 task tamamlandı)

## **Növbəti Addımlar**

### **İmmediat (Bu həftə):**
1. ✅ `ApprovalActions.tsx` komponentini tamamla
2. ✅ `ColumnBasedApprovalManager.tsx` əsas konteyneri yarat
3. ⏳ SQL stored procedures yarat
4. ✅ `ColumnBasedApproval.tsx` səhifəsi yarat
5. ✅ Route integration tamamla
6. ✅ Mode switcher əlavə et

### **Orta müddət (Gələn həftə):**
1. ⏳ Route integration
2. ⏳ Testing suite yazışı
3. ⏳ Performance optimization
4. ⏳ Legacy komponentlərin silinməsi

### **Uzun müddət (Bu ay):**
1. ⏳ User acceptance testing
2. ⏳ Documentation completion
3. ⏳ Performance monitoring setup
4. ⏳ Production deployment

## **Risk Analizi**

### **Yüksək Risk:**
- SQL stored procedures yaradılması və test edilməsi
- Mövcud approval sistemi ilə conflict

### **Orta Risk:**
- User adoption - istifadəçilərin yeni interfeysi öyrənməsi
- Performance - böyük data set-lərdə yavaşlıq

### **Aşağı Risk:**
- UI komponentlərinin tamamlanması
- Type safety və kod keyfiyyəti

## **Success Metrics**

### **Texniki Metrikalar:**
- Approval prosesində 50% sürət artırılması
- 90%+ code coverage testlərdə
- <2 saniyə səhifə yüklənmə vaxtı

### **İstifadəçi Məmnunluğu:**
- 80%+ istifadəçi məmnunluğu (survey)
- 30% error rate azalması
- User training müddətinin qısaldılması

---

**Son Yenilənmə:** 23 İyun 2025  
**Hazırlayan:** AI Assistant  
**Status:** 🔄 Aktiv İnkişaf  
**Növbəti İcmal:** 24 İyun 2025
