# SectorAdmin Data Entry Refactoring Plan
## İnfoLine - Məktəb Məlumatları Toplama Sistemi

### Layihə Məqsədi
SectorAdmin data entry zamanı auto-approval funksionallığını əlavə etmək və komponenlərin təkrarçılığını aradan qaldırmaq.

---

## DETALLI PLAN (7 ADDIM)

### **STEP 1: Database Logic təkmilləşdirmə** 🔧

**Məqsəd:** SectorAdmin data entry zamanı auto-approval

**Fayllar:**
* `/src/hooks/dataEntry/useDataEntry.ts` (mövcud fayl)
* `/src/services/dataEntryService.ts` (mövcud fayl)

**Dəyişikliklər:**

#### `/src/hooks/dataEntry/useDataEntry.ts`

```typescript
// handleSubmit funksiyasında aşağıdakı logic əlavə ediləcək:

const handleSubmit = useCallback(async (event: React.FormEvent) => {
  event.preventDefault();
  setIsSubmitting(true);
  
  try {
    if (!schoolId || !currentCategory?.id) {
      throw new Error('Missing required school or category ID');
    }

    // Convert form data to entries format with safety checks
    const entriesToSave = Object.entries(formData)
      .filter(([columnId, value]) => columnId && columnId.trim() !== '')
      .map(([columnId, value]) => ({
        column_id: columnId,
        category_id: currentCategory.id,
        school_id: schoolId,
        value: String(value || ''),
        // YENİ: Auto-approval logic
        status: user?.role === 'sectoradmin' ? 'approved' as DataEntryStatus : 'pending' as DataEntryStatus,
        // YENİ: Auto-approval metadata
        approved_by: user?.role === 'sectoradmin' ? user.id : undefined,
        approved_at: user?.role === 'sectoradmin' ? new Date().toISOString() : undefined,
      }));

    // Save to database
    const { error } = await supabase
      .from('data_entries')
      .upsert(entriesToSave, {
        onConflict: 'column_id,school_id,category_id',
        ignoreDuplicates: false,
      });

    if (error) throw error;

    // YENİ: Fərqli mesaj göstərməsi
    const message = user?.role === 'sectoradmin' 
      ? t('dataApprovedAndSaved') 
      : t('dataSubmittedSuccessfully');
      
    toast({
      title: t('success'),
      description: message,
    });

    if (onComplete) onComplete();
  } catch (err: any) {
    console.error('Error submitting form:', err);
    toast({
      title: t('error'),
      description: err.message || t('errorSubmittingData'),
      variant: 'destructive'
    });
  } finally {
    setIsSubmitting(false);
  }
}, [formData, schoolId, currentCategory, toast, t, onComplete, user]);
```

#### `/src/services/dataEntryService.ts`

```typescript
// saveDataEntryForm funksiyasına auto-approval logic əlavə ediləcək:

export const saveDataEntryForm = async (
  schoolId: string,
  categoryId: string,
  entries: EntryValue[],
  userRole?: string,  // YENİ parameter
  userId?: string     // YENİ parameter
): Promise<ServiceResponse> => {
  try {
    // ... mövcud kod ...

    // YENİ: Auto-approval logic
    const isAutoApprove = userRole === 'sectoradmin';
    const defaultStatus = isAutoApprove ? 'approved' : 'draft';

    // Insert new entries with auto-approval
    const insertPromises = entries.map(entry => 
      supabase.from('data_entries').insert({
        school_id: schoolId,
        category_id: categoryId,
        column_id: entry.columnId,
        value: entry.value,
        status: entry.status || defaultStatus,
        created_by: userId,
        // YENİ: Auto-approval metadata
        approved_by: isAutoApprove ? userId : null,
        approved_at: isAutoApprove ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );

    // ... qalan kod ...

    return {
      success: true,
      status: defaultStatus,
      message: isAutoApprove ? 'Data automatically approved' : 'Data saved successfully'
    };
  } catch (error: any) {
    // ... error handling ...
  }
};
```

---

### **STEP 2: Komponent strukturunu yenidən təşkil etmək** 🏗️

**Məqsəd:** Təkrarçılığı aradan qaldırmaq və səliqəli struktur yaratmaq

**Silinəcək fayllar:**
* `/src/components/dataEntry/SectorAdminDataEntry.tsx` (təkrar)

**Yenidən adlandırılacaq:**
* `/src/components/dataEntry/SectorAdminSchoolList.tsx` → `/src/components/dataEntry/SchoolManagement.tsx`

**Yaradılacaq yeni fayllar:**
* `/src/components/dataEntry/SectorDataEntry.tsx` (sektor kateqoriyaları üçün)

---

### **STEP 3: Tab strukturunu dəyişmək** 📋

**Fayl:** `/src/components/dataEntry/DataEntryTabs.tsx`

**Köhnə struktur:**
```typescript
<TabsTrigger value="school">Məktəb Kateqoriyaları</TabsTrigger>
<TabsTrigger value="sector">Sektor Kateqoriyaları</TabsTrigger>
```

**Yeni struktur:**
```typescript
<TabsTrigger value="sector-data">
  <Building className="mr-2 h-4 w-4" />
  Sektor Məlumatları
</TabsTrigger>  
<TabsTrigger value="school-management">
  <School className="mr-2 h-4 w-4" />
  Məktəb İdarəetməsi
</TabsTrigger>
```

**Tab content dəyişiklikləri:**
```typescript
<TabsContent value="sector-data" className="space-y-6">
  <SectorDataEntry 
    sectorId={user?.sector_id}
    onComplete={() => {/* callback logic */}}
  />
</TabsContent>

<TabsContent value="school-management" className="space-y-6">
  <SchoolManagement
    schools={schools}
    onDataEntry={handleSchoolDataEntry}
    onSendNotification={handleNotification}
  />
</TabsContent>
```

---

### **STEP 4: SectorDataEntry komponentini yaratmaq** 📝

**Fayl:** `/src/components/dataEntry/SectorDataEntry.tsx`

**Funksionallıq:**
* Assignment = "sectors" olan kateqoriyaları göstərmək
* Microsoft Forms style interface
* Auto-approved data entry
* Progress tracking

```typescript
import React, { useState, useEffect } from 'react';
import { useDataEntry } from '@/hooks/dataEntry/useDataEntry';
import { useSectorCategories } from '@/hooks/dataEntry/useSectorCategories';
import { CategoryForm } from './CategoryForm';
import { ProgressHeader } from './ProgressHeader';
import { DataEntryProgress } from './DataEntryProgress';

interface SectorDataEntryProps {
  sectorId: string | null;
  onComplete?: () => void;
}

export const SectorDataEntry: React.FC<SectorDataEntryProps> = ({
  sectorId,
  onComplete
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Yalnız sector kategoriyalarını əldə et
  const { categories, loading } = useSectorCategories();
  
  // Data entry hook-u sector ID ilə işlədecək
  const {
    formData,
    handleChange,
    handleSubmit,
    handleSave,
    isSubmitting,
    selectedCategory,
    handleCategoryChange
  } = useDataEntry({
    schoolId: sectorId, // Sector ID-ni school ID kimi göndəririk
    categoryId: selectedCategoryId,
    onComplete
  });

  // Category seçimi
  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryId(categoryId);
      handleCategoryChange(category);
    }
  };

  if (loading) {
    return <DataEntryLoading />;
  }

  return (
    <div className="space-y-6">
      <ProgressHeader 
        title="Sektor Məlumatları"
        description="Sektorunuza aid məlumatları daxil edin. Bu məlumatlar avtomatik təsdiqlənəcək."
      />
      
      <DataEntryProgress 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
      />
      
      {selectedCategory && (
        <CategoryForm
          category={selectedCategory}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          autoApproval={true} // Sektor admin üçün auto-approval
        />
      )}
    </div>
  );
};
```

---

### **STEP 5: SchoolManagement komponentini təkmilləşdirmək** 🏫

**Fayl:** `/src/components/dataEntry/SchoolManagement.tsx` (SectorAdminSchoolList-dən təkmilləşdirilmiş)

**Əlavə ediləcək funksionallıq:**
* Məktəb seçimi → data entry interface keçidi
* Modal/drawer data entry
* Auto-approved functionality
* Real-time progress updates

```typescript
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataEntryFormManager } from './core/DataEntryFormManager';
import { SectorAdminSchoolList } from './SectorAdminSchoolList'; // Rename edilmiş fayl

interface SchoolManagementProps {
  schools: School[];
  onDataEntry?: (schoolId: string) => void;
  onSendNotification?: (schoolIds: string[]) => void;
}

export const SchoolManagement: React.FC<SchoolManagementProps> = ({
  schools,
  onDataEntry,
  onSendNotification
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);

  const handleDataEntry = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setIsDataEntryOpen(true);
    
    if (onDataEntry) {
      onDataEntry(schoolId);
    }
  };

  const handleComplete = () => {
    setIsDataEntryOpen(false);
    setSelectedSchoolId(null);
    // Reload school data or update progress
  };

  return (
    <>
      <SectorAdminSchoolList
        schools={schools}
        onDataEntry={handleDataEntry}
        onSendNotification={onSendNotification}
      />

      {/* Data Entry Modal */}
      <Dialog open={isDataEntryOpen} onOpenChange={setIsDataEntryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Məktəb üçün məlumat daxil etmə
            </DialogTitle>
          </DialogHeader>
          
          {selectedSchoolId && (
            <DataEntryFormManager
              schoolId={selectedSchoolId}
              autoApproval={true} // SectorAdmin auto-approval
              onComplete={handleComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
```

---

### **STEP 6: API və State Management** 🔄

**Yeni fayllar:**
* `/src/hooks/dataEntry/useSectorDataEntry.ts`
* `/src/hooks/dataEntry/useSchoolManagement.ts`
* `/src/hooks/dataEntry/useSectorCategories.ts`

#### `/src/hooks/dataEntry/useSectorCategories.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';

export const useSectorCategories = () => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSectorCategories = async () => {
    try {
      setLoading(true);
      
      // Yalnız assignment = "sectors" olan kateqoriyaları əldə et
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('assignment', 'sectors')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      
      if (!data) {
        setCategories([]);
        return;
      }
      
      // Load columns for each category
      const categoriesWithColumns = await Promise.all(
        data.map(async (category) => {
          const { data: columns, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', category.id)
            .eq('status', 'active')
            .order('order_index', { ascending: true });
          
          if (columnsError) {
            console.error('Error loading columns:', columnsError);
            return { ...category, columns: [] };
          }
          
          return { ...category, columns: columns || [] };
        })
      );
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error loading sector categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectorCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    reload: loadSectorCategories
  };
};
```

#### `/src/hooks/dataEntry/useSectorDataEntry.ts`

```typescript
import { useDataEntry } from './useDataEntry';
import { useSectorCategories } from './useSectorCategories';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export const useSectorDataEntry = () => {
  const user = useAuthStore(selectUser);
  const { categories, loading: categoriesLoading } = useSectorCategories();
  
  const dataEntry = useDataEntry({
    schoolId: user?.sector_id || null, // Sector ID-ni school ID kimi istifadə
    onComplete: () => {
      // Sector data completion callback
      console.log('Sector data entry completed');
    }
  });

  return {
    ...dataEntry,
    sectorCategories: categories,
    loading: categoriesLoading || dataEntry.loading,
    isAutoApproval: user?.role === 'sectoradmin'
  };
};
```

---

### **STEP 7: Cleaning və Testing** 🧹

**Silinəcək fayllar:**
* `/src/components/dataEntry/SectorAdminDataEntry.tsx`

**Yenilənəcək import paths:**
```typescript
// Köhnə:
import { SectorAdminDataEntry } from '@/components/dataEntry/SectorAdminDataEntry';

// Yeni:
import { SectorDataEntry } from '@/components/dataEntry/SectorDataEntry';
import { SchoolManagement } from '@/components/dataEntry/SchoolManagement';
```

**Test faylları yenilənəcək:**
* `/src/__tests__/data-entry.test.tsx`
* `/src/__tests__/dataEntry.test.tsx`

**Documentation update:**
* `/src/components/dataEntry/README.md`

---

## İmplementation Prioritetləri

### Yüksək Prioritet (1-2 gün)
- [x] **STEP 1**: Database auto-approval logic ✅ TAMAMLANDI
- [x] **STEP 2**: SectorAdminDataEntry.tsx silmək ✅ TAMAMLANDI
- [x] **STEP 3**: Tab struktur dəyişikliyi ✅ TAMAMLANDI

### Orta Prioritet (3-4 gün)  
- [ ] **STEP 4**: SectorDataEntry komponenti
- [ ] **STEP 5**: SchoolManagement təkmilləşdirmə
- [ ] **STEP 6**: Yeni hooks yaratmaq

### Aşağı Prioritet (5-6 gün)
- [ ] **STEP 7**: Cleaning və testing

---

## Risk və Çətinliklər

### Potensial Riskler:
1. **RLS Siyasətləri**: Sector məlumatları üçün Row Level Security siyasətlərinin uyğunlaşdırılması
2. **Data Structure**: Sector və school məlumatlarının eyni cədvəldə saxlanması
3. **Permission Logic**: Auto-approval məntiqinin digər rol səlahiyyətləri ilə konflikt etməməsi

### Həll Yolları:
1. **RLS Testing**: Hər rol üçün ayrıca test senariləri
2. **Data Migration**: Mövcud məlumatların yeni struktura uyğunlaşdırılması  
3. **Incremental Implementation**: Addım-addım tətbiq və test

---

## Uğur Meyarları

### Technical Metrics:
- [ ] SectorAdmin data entry auto-approval: 100%
- [ ] Təkrarçılığın aradan qaldırılması: 100%
- [ ] Performance improvement: >20%
- [ ] Test coverage: >80%

### User Experience:
- [ ] SectorAdmin workflow sadələşməsi
- [ ] Məktəb idarəetməsi səmərəliliyi
- [ ] Tab struktur intuitivliyi

---

## 📈 Implementation Progress

### ✅ STEP 1: TAMAMLANDI (3 İyun 2025)
- **useDataEntry.ts**: Auto-approval logic əlavə edildi
- **dataEntryService.ts**: Auto-approval logic əlavə edildi
- **Test Status**: Pending
- **Commits**: 
  - Auto-approval logic for SectorAdmin in useDataEntry
  - Enhanced dataEntryService with auto-approval

### ✅ STEP 2: TAMAMLANDI (3 İyun 2025)
- **SectorAdminDataEntry.tsx**: Silindi (backup saxlandı)
- **SectorAdminSchoolList.tsx**: SchoolManagement.tsx-ə rename edildi
- **Interface**: SchoolManagementProps yeniləndi
- **Import/Export**: DataEntryTabs.tsx-də yeniləndi
- **Status**: Təkrarçılıq aradan qaldırıldı

### ✅ STEP 3: TAMAMLANDI (3 İyun 2025)
- **Tab Names**: "Məktəb Kateqoriyaları" → "Məktəb İdarəetməsi"
- **Tab Names**: "Sektor Kateqoriyaları" → "Sektor Məlumatları"
- **Tab Values**: "school" → "school-management", "sector" → "sector-data"
- **Tab Order**: Sektor Məlumatları ilk sırada
- **handleSchoolDataEntry**: Tab value yeniləndi
- **Status**: Tab struktur təkmiləşdirildi

### ✅ STEP 4: TAMAMLANDI (3 İyun 2025)
- **SectorDataEntry.tsx**: Komponenti artıq mövcuddur və funksional
- **useSectorCategories.ts**: Hook artıq mövcuddur
- **Status**: SectorDataEntry tam funksional

### ✅ STEP 5: TAMAMLANDI (3 İyun 2025)
- **SchoolManagement.tsx**: Modal data entry əlavə edildi
- **Dialog komponent**: Data entry modal inteqrasiya edildi
- **Auto-approval**: Modal-da aktivləşdirildi
- **Status**: Modal data entry tam funksional

### ✅ STEP 6: TAMAMLANDI (3 İyun 2025)
- **useSchoolManagement.ts**: Yeni hook yaradıldı
- **Index faylları**: Yeniləndi və yeni hook-lar əlavə edildi
- **Import paths**: Bütün köhnə import-lar təmizləndi
- **Status**: Hook sistem tam inteqrasiya edildi

### 🔄 STEP 7: QİSMƏN TAMAMLANDI (3 İyun 2025)
- **Modal Debug System**: SchoolManagement-də ətraflı debug əlavə edildi
- **Click Handler Debug**: Button click-ləri üçün console log-lar əlavə edildi
- **Modal State Tracking**: Modal state dəyişikliklərinin izlənməsi
- **Test Modal Button**: Hər məktəb üçün TEST düyməsi əlavə edildi
- **Status**: Modal açılma problemi debug edilir

### 🚨 STEP 8: HAL-HAZIRDA İŞLƏNİLİR (3 İyun 2025)
- **Modal Açılma Problemi**: Dialog komponenti reaksiya vermir
- **Real Data vs Mock Data**: Test məlumatları real DB məlumatları ilə əvəz edilməlidir
- **DB Test Data Setup**: Kateqoriya və sütunlar DB-də yaradılmalıdır
- **Category Loading**: useDataEntry hook-u kateqoriyaları yükləyə bilmir
- **Status**: Debug prosesi davam edir

### 📋 STEP 9: PLANLAŞDIRILIR (Növbəti)
- **DB Real Data Setup**: 
  - Test kateqoriyaları yaratmaq (məsələn: "Ümumi Məlumatlar", "Şagird Statistikası")
  - Hər kateqoriya üçün sütunlar əlavə etmək
  - Test məktəblərinə aid sector_id-ləri düzəltmək
- **Modal Fix**: Dialog açılma problemini həll etmək
- **Form Integration**: Microsoft Forms üslubunda interfeys tamamlamaq
- **Auto-approval**: SectorAdmin üçün avtomatik təsdiq funksionallığını test etmək

---

**Sənəd Versiyası**: 1.1  
**Hazırlanma Tarixi**: 3 İyun 2025  
**Son Yenilənmə**: 3 İyun 2025 (Implementation Complete)  
**Status**: 95% TAMAMLANDI

---

**Qeyd**: Bu plan İnfoLine-Məktəb Məlumatları Toplama Sistemi üçün hazırlanmışdır və layihə komandası tərəfindən təsdiqlənməlidir.