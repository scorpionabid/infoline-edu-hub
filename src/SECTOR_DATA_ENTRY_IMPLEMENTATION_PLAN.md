# Sektoradmin üçün Sektora Aid Kateqoriya Data Entry İmplementasiya Planı

## 📋 Problem Təsviri

Sektoradmin rollu istifadəçilər hazırda yalnız məktəblər üçün proxy data entry edə bilirlər. Ancaq sistemdə `assignment='sectors'` tipli kateqoriyalar mövcuddur və sektoradminlər bu kateqoriyalara birbaşa məlumat daxil edə bilməlidirlər. Bu məlumatlar `sector_data_entries` cədvəlinə yazılmalı və təsdiq olunmuş statusda save edilməlidir.

## 🎯 Tələb Olunan Funksionallıq

### 1. Sektora Aid Kateqoriya Görünümü
- Sektoradmin `assignment='sectors'` və `assignment='all'` tipli kateqoriyaları görməlidir
- Bu kateqoriyalar ayrı badge ilə işarələnməlidir
- Məktəb kateqoriyalarından fərqlənməlidir

### 2. Sektora Aid Data Entry
- Sektoradmin seçilmiş kateqoriya və sütuna məlumat daxil edə bilməlidir
- Məlumat birbaşa `sector_data_entries` cədvəlinə yazılmalıdır
- Status avtomatik olaraq `approved` olmalıdır (təsdiq prosesi tələb olunmur)

### 3. Workflow İnteqrasiyası
- Mövcud workflow sistemi içərisində sector data entry modu olmalıdır
- User interface intuitiv və fərqləndirici olmalıdır

## 🏗️ İmplementasiya Strategiyası

### Backwards Compatible Yanaşma
- Mövcud funksionallıq pozulmayacaq
- Yeni parametrlər optional olacaq  
- Köhnə API-lər saxlanacaq
- Conditional rendering istifadə ediləcək

## 📁 Dəyişəcək Fayllar

### 1. Primary Dəyişikliklər

| Fayl | Əməliyyat | Prioritet | Təsvir |
|------|-----------|-----------|--------|
| `src/components/dataEntry/workflow/DataEntryContext.tsx` | 🔄 Yenilə | YÜKSƏK | Role-based kategori filtrləməsi əlavə et |
| `src/components/dataEntry/workflow/useDataEntryWorkflow.ts` | 🔄 Yenilə | YÜKSƏK | Sector data entry mode dəstəyi |
| `src/pages/SectorDataEntry.tsx` | 🔄 Yenilə | ORTA | Sector vs School entry seçimi |
| `src/services/api/sectorDataEntry.ts` | 🔄 Yenilə | ORTA | Single value entry funksiyası |

### 2. Supporting Dəyişikliklər

| Fayl | Əməliyyat | Prioritet | Təsvir |
|------|-----------|-----------|--------|
| `src/hooks/dataEntry/sector/useSectorCategories.ts` | ✅ Kontrol | AŞAĞI | Hook-un düzgün işləməsini yoxla |
| `src/components/dataEntry/workflow/ProgressIndicator.tsx` | 🔄 Yenilə | AŞAĞI | Sector mode indicator |
| `src/translations/az/dataEntry.ts` | ➕ Əlavə | AŞAĞI | Yeni tərcümələr |

## 🚀 İmplementasiya Addımları

### Phase 1: Core Infrastructure (Gün 1)
1. **DataEntryContext təkmilləşdirmə**
   - `userRole` və `entryType` props əlavə etmək
   - Role-based category query yazmaq
   - Sector assignment badge əlavə etmək

2. **Workflow hook genişləndirmə**
   - `entryType: 'school' | 'sector'` parametr əlavə etmək
   - Sector data validation logic
   - State management təkmilləşdirmə

### Phase 2: Data Layer (Gün 1-2)
3. **Sector Data Entry Service**
   - Single value entry funksiyası yazmaq
   - Approved status ilə save etmə
   - Error handling və validation

4. **API Integration**
   - Service-i workflow ilə inteqrasiya etmək
   - Success/error handling

### Phase 3: User Interface (Gün 2)
5. **UI Components**
   - Sector vs School mode selector
   - Sector category badges
   - Success messages və notifications

6. **Page Integration**
   - SectorDataEntry səhifəsində yeni flow activate etmək
   - Navigation və routing yoxlamaq

### Phase 4: Testing & Polish (Gün 2-3)
7. **Testing**
   - Unit testlər yazmaq
   - Integration testlər
   - User acceptance testing

8. **Documentation**
   - Kod şərhləri yeniləmek
   - User guide hazırlamaq

## 🔧 Texniki Detallar

### 1. DataEntryContext Yeniləmələri

```typescript
interface DataEntryContextProps {
  selectedCategory: string | null;
  selectedColumn: string | null;
  onCategoryChange: (categoryId: string) => void;
  onColumnChange: (columnId: string) => void;
  mode: 'single' | 'bulk';
  
  // 🆕 Yeni parametrlər (optional - backwards compatible)
  userRole?: string;
  entryType?: 'school' | 'sector';
  className?: string;
}
```

### 2. Workflow Hook Genişləndirmə

```typescript
// 🆕 Yeni state fields
interface DataEntryWorkflowState {
  // ... mövcud fields
  entryType: 'school' | 'sector';    // Yeni
  targetType: 'schools' | 'sector';  // Yeni
}
```

### 3. Sector Data Entry Service

```typescript
// 🆕 Yeni service function
export const saveSingleSectorDataEntry = async (
  sectorId: string,
  categoryId: string,
  columnId: string,
  value: string,
  userId: string
) => {
  const entry = {
    sector_id: sectorId,
    category_id: categoryId,
    column_id: columnId,
    value,
    status: 'approved', // 🎯 Birbaşa təsdiq olunmuş
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('sector_data_entries')
    .upsert(entry, { onConflict: 'sector_id,category_id,column_id' })
    .select();
  
  if (error) throw error;
  return data[0];
};
```

## 🔍 Risk Analizi

### ✅ Aşağı Risk (≈5%)
- **Təcrid edilmiş komponentlər:** DataEntryContext yalnız SectorDataEntry səhifəsində istifadə olunur
- **Optional parametrlər:** Yeni funksionallıq mövcud API-ləri pozmur
- **Backwards compatibility:** Köhnə funksionallıq saxlanır

### ⚠️ Potensial Risklər və Həll Yolları

| Risk | Həll Yolu | Prioritet |
|------|-----------|-----------|
| Query performance | Indexləmə və keşləmə | AŞAĞI |
| User confusion | Clear UI indicators və tooltips | ORTA |
| Data consistency | Transaction və validation | YÜKSƏK |

## ✅ Test Scenarios

### 1. Functional Tests
- [ ] Sektoradmin sektora aid kateqoriyaları görür
- [ ] Məktəb kateqoriyalarından fərqlənir
- [ ] Data successful save olunur
- [ ] Status approved olaraq set edilir
- [ ] Validation düzgün işləyir

### 2. Integration Tests  
- [ ] Mövcud school data entry funksionallığı pozulmur
- [ ] Workflow transitions düzgün işləyir
- [ ] Error handling düzgün işləyir
- [ ] Performance acceptable qalır

### 3. User Experience Tests
- [ ] UI intuitiv və aydındır
- [ ] Success feedback verilir
- [ ] Error messages faydalıdır
- [ ] Navigation smooth işləyir

## 📊 Success Metrics

### Texniki KPI-lər
- [ ] Zero breaking changes mövcud funksionallıqda
- [ ] Response time < 500ms sector data entry üçün
- [ ] Error rate < 1% new funksionallıqda

### İstifadəçi KPI-ləri  
- [ ] Sektoradmin uğurla sector data entry edə bilir
- [ ] UI/UX confusion minimum səviyyədə
- [ ] Sector kateqoriyalar düzgün fərqlənir

## 🎯 Definition of Done

✅ **Funksional Tələblər:**
- Sektoradmin sektora aid kateqoriyaları görür və seçə bilir
- Sector data entry uğurla edilir və `approved` status ilə save olunur
- UI aydın fərqləndirmə göstərir

✅ **Texniki Tələblər:**
- Bütün testlər pass edir
- Code review tamamlanır  
- Performance requirements qarşılanır
- Documentation yenilənir

✅ **Keyfiyyət Tələbləri:**
- Zero breaking changes
- Backwards compatibility qorunur
- Error handling comprehensive

## 📅 Timeline

| Mərhələ | Müddət | Status |
|---------|--------|--------|
| Phase 1: Core Infrastructure | 0.5 gün | 🔄 Planlaşdırıldı |
| Phase 2: Data Layer | 0.5 gün | ⏳ Gözləyir |
| Phase 3: User Interface | 0.5 gün | ⏳ Gözləyir |
| Phase 4: Testing & Polish | 0.5 gün | ⏳ Gözləyir |
| **TOTAL** | **2 gün** | |

## 👥 Məsul Şəxslər

- **Developer:** AI Assistant + Human Review
- **Tester:** Manual testing + Automated tests  
- **Reviewer:** Code review və approval
- **Deployment:** Production release

## 📝 Implementation Notes

### Diqqət Ediləcək Məqamlar
1. **Yalnız optional parametrlər əlavə etmək**
2. **Conditional rendering istifadə etmək**  
3. **Mövcud API-ləri saxlamaq**
4. **Error handling comprehensive etmək**
5. **User feedback clear etmək**

### Post-Implementation  
- [ ] Performance monitoring
- [ ] User feedback toplama
- [ ] Bug fixing əgər lazım olarsa
- [ ] Documentation update

---

**📋 Plan Status:** HAZIR  
**🎯 Risk Level:** AŞAĞI (≈5%)  
**⏱️ Estimated Duration:** 2 gün  
**✅ Approved by:** Pending Review

---

*Son yenilənmə: 19 İyun 2025*
*Versiya: 1.0*