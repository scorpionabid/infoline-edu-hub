# Sektor CRUD Əməliyyatları - Təkmilləşdirmə Planı

## 📋 Proyekt Məlumatları
- **Tarix**: 1 İyul 2025
- **Status**: Planlanma Mərhələsi
- **Prioritet**: Yüksək
- **Məsul**: Development Team

## 🚨 Problemin Təsviri

### Hazırda Mövcud Problemlər:
1. ❌ **Sektor redaktəsi işləmir** - mockup implementasiya
2. ❌ **Sektor silmə işləmir** - mockup implementasiya  
3. ❌ **useUpdateSector** hook mövcud deyil
4. ❌ **useDeleteSector** hook mövcud deyil
5. ⚠️ **Təbəlilik münasibətləri** idarə edilmir

### Təbəlilik Strukturu:
```
regions (1) ──► sectors (n) ──► schools (n)
                               ├─► user_roles (sectoradmin)
                               └─► data_entries (sector_data_entries)
```

## 🎯 Seçilmiş Strategiya: **Soft Delete + Smart Validation**

### Üstünlükləri:
- ✅ **Təhlükəsizlik**: Data integrity qorunur
- ✅ **Geri qaytarılma**: Yanlış silinmiş məlumatlar bərpa edilə bilər
- ✅ **Audit Trail**: Bütün əməliyyatlar izlənir
- ✅ **İstifadəçi dostu**: Aydın warning və confirmation

## 📋 Həyata Keçirmə Planı

### **Mərhələ 1: Hooks Yaratma** ✅
#### 1.1 useUpdateSector.ts
- [x] Fayl yaratma
- [x] Validation logic əlavə etmə
- [x] Error handling implementasiyası
- [x] RLS icazələrinin yoxlanması
- [x] Loading state idarəetməsi

#### 1.2 useDeleteSector.ts
- [x] Fayl yaratma
- [x] Dependency check funksiyası
- [x] Soft delete logic
- [x] Cascade validation
- [x] Audit log əlavə etmə

### **Mərhələ 2: Components Yeniləmə** ✅
#### 2.1 SectorsContainer.tsx
- [x] Mock funksiyaları real hooks ilə əvəz etmə
- [x] Error state handling
- [x] Loading indicators əlavə etmə
- [x] Success/error notifications

#### 2.2 DeleteSectorDialog.tsx
- [x] Dependency warning əlavə etmə
- [x] Confirmation steps implementasiyası
- [x] Progress indicator

### **Mərhələ 3: Validation & Testing** ✅
#### 3.1 Functional Testing
- [x] Update əməliyyatları test etmə
- [x] Delete əməliyyatları test etmə
- [x] Dependency validation test
- [x] RLS permissions test

#### 3.2 UI/UX Testing
- [x] Error messages test
- [x] Loading states test
- [x] User feedback test

### **Mərhələ 4: Enhanced Delete Strategy** ✅
#### 4.1 İki Mərhələli Silmə Sistemi
- [x] İlk təklif: Soft Delete (Deaktiv etmə)
- [x] Əlavə seçim: Hard Delete (Tamamilə silmə)
- [x] User-friendly interface design
- [x] Təhlükəli əməliyyat xəbərdarlığı

#### 4.2 RLS Policy Düzəlişi
- [x] Audit log RLS xətası həll edildi
- [x] Fallback mechanism əlavə edildi
- [x] Error handling təkmilləşdirildi

### **Final Nəticə** 🎆
- [x] Soft Delete (tövsiyə edilir) - Deaktiv etmə
- [x] Hard Delete (təhlükəli) - Tamamilə silmə
- [x] Smart dependency warnings
- [x] Enhanced UX ilə user guidance

## 🔧 Texniki Təfərrüatlar

### **useUpdateSector.ts** Spesifikasiyası:
```typescript
interface UpdateSectorData {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

interface UseUpdateSectorReturn {
  updateSector: (data: UpdateSectorData) => Promise<Sector | null>;
  loading: boolean;
  error: string | null;
}
```

### **useDeleteSector.ts** Spesifikasiyası:
```typescript
interface DeleteDependencies {
  schoolCount: number;
  adminCount: number;
  dataEntries: number;
}

interface UseDeleteSectorReturn {
  deleteSector: (sectorId: string, force?: boolean) => Promise<boolean>;
  checkDependencies: (sectorId: string) => Promise<DeleteDependencies>;
  loading: boolean;
  error: string | null;
}
```

### **Soft Delete Strategiyası:**
1. **İlk yoxlama**: Təbəli məlumatların mövcudluğu
2. **Warning göstərmə**: İstifadəçiyə məlumat vermə
3. **Confirmation**: İki mərhələli təsdiq
4. **Soft delete**: `status: 'inactive'` + `deleted_at: timestamp`
5. **Audit log**: Əməliyyatın qeydə alınması

## 📊 Dependency Validation Rules

### **Sektor silinməzdən əvvəl yoxlanacaq:**
| Təbəli Element | Sayı | Reakciya |
|----------------|------|----------|
| Məktəblər | > 0 | ⚠️ Warning + məktəb siyahısı |
| Məktəb Adminləri | > 0 | ⚠️ Warning + admin siyahısı |
| Data Entries | > 0 | ⚠️ Warning + məlumat sayı |
| Sector Data | > 0 | ⚠️ Warning + sektor məlumatları |

### **Warning Message Template:**
```
⚠️ DİQQƏT: Bu sektoru silmək istədiyinizə əminsiniz?

Bu sektor silinərsə:
• X məktəb "deaktiv" statusuna keçəcək
• Y məktəb admini təyin edilməyəcək  
• Z məlumat entry "arxivləşəcək"

Əməliyyat geri qaytarıla bilər.
```

## 🔐 Təhlükəsizlik Tələbləri

### **RLS (Row Level Security) Yoxlamaları:**
1. **SuperAdmin**: Bütün sektorlara tam giriş
2. **RegionAdmin**: Yalnız öz regionundakı sektorlara giriş
3. **SectorAdmin**: Yalnız oxuma icazəsi (öz sektoruna)
4. **SchoolAdmin**: Oxuma icazəsi yoxdur

### **Audit Trail:**
```sql
INSERT INTO audit_logs (
  user_id, action, entity_type, entity_id, 
  old_value, new_value, ip_address, user_agent
) VALUES (
  auth.uid(), 'soft_delete', 'sector', sector_id,
  old_sector_data, new_sector_data, request_ip, request_agent
);
```

## 📅 Timeline və Məsuliyyətlər

### **Sprint 1 (1-2 gün):**
- [ ] useUpdateSector.ts hook yazma
- [ ] useDeleteSector.ts hook yazma
- [ ] Unit testlər yazma

### **Sprint 2 (1 gün):**
- [ ] SectorsContainer.tsx yeniləmə
- [ ] DeleteSectorDialog.tsx təkmilləşdirmə
- [ ] UI component testləri

### **Sprint 3 (0.5 gün):**
- [ ] Integration testing
- [ ] Bug fixes
- [ ] Documentation update

## ✅ Definition of Done

### **Mərhələ tamamlandıqda:**
1. ✅ Sektor redaktəsi tam işləyir
2. ✅ Sektor silmə dependency validation ilə işləyir
3. ✅ Bütün testlər keçir
4. ✅ Error handling düzgün işləyir
5. ✅ UI feedback aydın və informatívdir
6. ✅ RLS təhlükəsizlik qaydaları işləyir
7. ✅ Audit logs düzgün yazılır

## 📝 Növbəti Addımlar

### **İndi başlanmalı:**
1. **useUpdateSector.ts** yaratmaq
2. **useDeleteSector.ts** yaratmaq
3. Əsas logic implementasiyası

### **Sonrakı mərhələ:**
1. Component integration
2. UI/UX improvements
3. Comprehensive testing

---

## 📞 Əlaqə və Dəstək
- **Developer**: Development Team
- **QA**: Testing Team  
- **Product Owner**: Project Manager

**Son yenilənmə**: 1 İyul 2025
**Növbəti review**: Hər mərhələ tamamlandıqdan sonra
