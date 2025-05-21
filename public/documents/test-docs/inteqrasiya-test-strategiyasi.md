# İnfoLine - İnteqrasiya Test Strategiyası

## Ümumi Məlumat

Bu sənəd, İnfoLine tətbiqinin inteqrasiya test strategiyasını və test ssenarilərini təsvir edir. İnteqrasiya testləri, sistemin müxtəlif komponentlərinin və modullarının birlikdə düzgün işlədiyini təmin etmək üçün hazırlanmışdır.

## İnteqrasiya Test Yanaşması

### Nə üçün İnteqrasiya Testləri?

İnfoLine tətbiqi, müxtəlif modullardan ibarət mürəkkəb bir sistemdir. Hər bir modul artıq unit testlərlə yoxlanılsa da, bu modulların birlikdə düzgün işlədiyini və sistemin funksional tələblərini qarşıladığını təmin etmək üçün inteqrasiya testləri zəruridir.

İnteqrasiya testləri vasitəsilə:
- Komponentlər arası əlaqələrdəki problemləri aşkar edirik
- İş axınlarının başdan-sona düzgün işlədiyini yoxlayırıq
- Unit testlərin qaçırdığı sistem səviyyəli xətaları tapırıq
- Mürəkkəb məlumat axınlarını yoxlayırıq

### İnteqrasiya Test Mühiti

İnteqrasiya testləri üçün xüsusi bir mühit yaradacağıq:

1. **Test Konfiqurasiyası**: 
   - Supabase-in test instansı
   - Test məlumat bazası
   - Test istifadəçi hesabları

2. **Mock Strategiyası**:
   - Xarici servisləri mock edəcəyik (məsələn, Excel import/export servisi)
   - Supabase RPC funksiyaları - test mühitində işləyəcək şəkildə konfiqurasiya ediləcək
   - Edge Functions - test üçün yenidən konfiqurasiya ediləcək

3. **Test Məlumatı**:
   - Müxtəlif test halları üçün test məlumatları hazırlanacaq
   - Sistemin Region-Sektor-Məktəb iyerarxiyası üçün test strukturu

## Test Ssenarileri

İnteqrasiya test ssenarilərini əsas iş axınları ətrafında təşkil edirik. Aşağıda əsas test ssenarilərini və onların əhatə etdiyi tətbiq hissələrini təqdim edirik.

### 1. Autentifikasiya və İcazələr İnteqrasiyası

**ID: INT-01**

**Təsvir**: İstifadəçi girişindən çıxışına qədər autentifikasiya və avtorizasiya prosesinin tam axınının yoxlanılması.

**Təsirli Komponentlər**:
- Auth Context
- usePermissions hook
- Protected Routes
- Dashboard Layout
- Sidebar (rol-əsaslı əlçatanlıq)

**Test Ssenarileri**:
- `INT-01-01`: Superadmin girişi və dashboard-a yönləndirmə
- `INT-01-02`: Region admin girişi və icazələrin düzgün tətbiqi
- `INT-01-03`: Məktəb admin girişi və icazələrin düzgün tətbiqi
- `INT-01-04`: İcazəsiz əməliyyatların bloklanması
- `INT-01-05`: Sessiyanın saxlanması və bərpası

**Yerinə yetirilmiş testlər**: ✅

**Nəticələr**:
- ✅ Müxtəlif rollar üçün giriş/çıxış əməliyyatları uğurla test edilib
- ✅ Rollar düzgün normallaşdırıldıqdan sonra icazə yoxlamaları işləyir
- ✅ Avtomatik yönləndirmə və rol-əsaslı marşrutlaşdırma test edilib
- ✅ Sessiyanın saxlanması və JWT token yenilənməsi ssenariləri test edilib
- ⚠️ Kiçik-böyük hərf problemləri normalizeRole funksiyası ilə həll edilib

### 2. İstifadəçi İdarəetməsi İnteqrasiyası

**ID: INT-02**

**Təsvir**: İstifadəçi yaratma, rol təyin etmə və idarəetmə prosesinin tam axınının yoxlanılması.

**Təsirli Komponentlər**:
- İstifadəçi formu
- İstifadəçi siyahısı
- Rol təyin etmə
- Edge Functions
- Supabase auth və profiles

**Test Ssenarileri**:
- `INT-02-01`: İstifadəçi yaratma və profil məlumatlarının saxlanması
- `INT-02-02`: Region admin təyin edilməsi və icazələrin yenilənməsi
- `INT-02-03`: İstifadəçi məlumatlarının redaktəsi və dəyişikliklərin Supabase ilə sinxronizasiyası
- `INT-02-04`: İstifadəçi silmə prosesi və bağlı məlumatların təmizlənməsi

### 3. Region-Sektor-Məktəb İyerarxiyası İnteqrasiyası

**ID: INT-03**

**Təsvir**: Region, sektor və məktəblərin yaradılması, idarə edilməsi və iyerarxik münasibətlərinin yoxlanılması.

**Təsirli Komponentlər**:
- Region/Sektor/Məktəb formaları
- İyerarxiya selectləri
- useRegions/useSectors/useSchools hooks
- Supabase tables və münasibətlər

**Test Ssenarileri**:
- `INT-03-01`: Region yaratma və ona bağlı sektorların əlaqələndirilməsi
- `INT-03-02`: Sektor yaratma və məktəblərin əlaqələndirilməsi
- `INT-03-03`: İyerarxik məlumatların müxtəlif komponentlərdə düzgün göstərilməsi
- `INT-03-04`: Region/sektor/məktəb silinməsi və bağlı məlumatların idarə edilməsi

### 4. Kateqoriya və Məlumat Strukturu İnteqrasiyası

**ID: INT-04**

**Təsvir**: Kateqoriya və sütunların yaradılması, idarə edilməsi və məlumat formaları ilə inteqrasiyasının yoxlanılması.

**Təsirli Komponentlər**:
- Kateqoriya/Sütun formaları
- Dinamik məlumat formaları
- useCategories/useColumns hooks
- Məlumat validasiyası
- Supabase tables

**Test Ssenarileri**:
- `INT-04-01`: Kateqoriya və sütunların yaradılması və dinamik formaya təsiri
- `INT-04-02`: Sütun tipləri və validasiya qaydalarının tətbiqi
- `INT-04-03`: Kateqoriya/sütun redaktəsi və mövcud məlumatlara təsiri
- `INT-04-04`: Kateqoriya/sütun silmə və məlumat bütövlüyünün qorunması

### 5. Məlumat Daxiletmə və Təsdiqlənmə İnteqrasiyası

**ID: INT-05**

**Təsvir**: Məlumatların daxil edilməsi, redaktəsi, təsdiqlənməsi və toplanmasının tam axınının yoxlanılması.

**Təsirli Komponentlər**:
- Məlumat daxiletmə formaları
- Excel import/export
- Məlumat təsdiqlənmə komponenti
- useDataEntry/useApprovalData hooks
- Role-based access control
- Notification system

**Test Ssenarileri**:
- `INT-05-01`: Məlumat daxiletmə və məktəb səviyyəsində göndərmə
- `INT-05-02`: Sektor admin təsdiqləmə prosesi
- `INT-05-03`: Region admin yoxlama və toplama prosesi
- `INT-05-04`: Məlumatların qaytarılması və yenidən göndərilməsi prosesi
- `INT-05-05`: Excel import və data validasiyası

**Yerinə yetirilmiş testlər**: ✅

**Nəticələr**:
- ✅ `approval-flow-integration.test.ts` faylında təsdiqləmə axını tam test edilib
- ✅ Müxtəlif istifadəçi rolları ilə məlumat daxil etmə və təsdiqləmə axını uğurla test edilib
- ✅ Məlumat statusu dəyişiklikləri (draft, submitted, sector_approved, region_approved) test edilib
- ✅ Rədd edilmiş məlumatların geri qaytarılması və yenidən göndərilməsi axını test edilib
- ⚠️ Status dəyişiklikləri zamanı async iş axını problemləri həll edilib - status dəyişdirilmə üçün mock-da callback istifadə edilir
- ⚠️ Təsdiqləmə axınında `usePermissions` hook-u üçün mock yaradılıb ki, müxtəlif rolları test edə bilək

### 6. Hesabat və Analitika İnteqrasiyası

**ID: INT-06**

**Təsvir**: Hesabatların generasiyası, export edilməsi və analitik məlumatların işlənməsinin yoxlanılması.

**Təsirli Komponentlər**:
- Hesabat generatoru
- Analitik dashboardlar
- Excel/PDF export
- Diaqram komponentləri
- useReports hook
- Data filters

**Test Ssenarileri**:
- `INT-06-01`: Hesabat parametrlərinin təyin edilməsi və hesabat generasiyası
- `INT-06-02`: PDF və Excel formatlarına export
- `INT-06-03`: Dashboard göstəricilərinin hesablanması
- `INT-06-04`: Bütün iyerarxik səviyyələr üçün hesabatların generasiyası

## İnteqrasiya Test Teknikası

İnteqrasiya testlərində aşağıdakı texniki yanaşmaları tətbiq edəcəyik:

### 1. Test Fixture Yanaşması

- Her bir test ssenarisi üçün xüsusi fixture hazırlanacaq
- Test fixture-lar test məlumatı və konfiqurasiyaları ehtiva edir
- Fixture-lar, testlər arası məlumat izolyasiyasını təmin edəcək

### 2. İnteqrasiya İdarəetmə Strategiyası

İnteqrasiya testləri "Bottom-up" (aşağıdan yuxarıya) yanaşmasına əsaslanacaq:
- Əvvəlcə daha kiçik komponent qrupları test ediləcək
- Sonra daha böyük və mürəkkəb inteqrasiyalara keçid ediləcək
- Nəhayət tam sistem səviyyəli axınlar test ediləcək

### 3. Mock Səviyyəsi

İnteqrasiya testlərində mock səviyyəsi minimuma endiriləcək:
- **Daxili komponentlər**: mock edilməyəcək
- **Supabase RPC/Functions**: test mühiti üçün real implementasiyadan istifadə ediləcək
- **Edge Functions**: test mühiti üçün konfiqurasiya edilmiş versiyalardan istifadə ediləcək
- **Xarici servislar**: mock ediləcək (email, Excel prosesləmə kimi)

### 4. Asynchronous Test Handling

İnteqrasiya testləri çoxlu asinxron əməliyyatlar ehtiva edir:
- `waitFor` və `act` funksiyalarından geniş istifadə ediləcək
- Timeout parametrləri test mühitinə uyğun tənzimlənəcək
- Race condition-ları aşkarlamaq üçün xüsusi testlər əlavə ediləcək

## İmplementasiya Planı və Tamamlanan İşlər

İnteqrasiya testlərinin implementasiyası üçün təklif edilən plan və onun hazırkı vəziyyəti:

1. **Hazırlıq Mərhələsi (Tamamlanıb)**
   - ✅ Test mühiti qurulub - Vitest və React Testing Library
   - ✅ Test fixture-ları hazırlanıb - Mock Supabase və istifadəçi rollları
   - ✅ Test utillər genişləndirilib - `test-integration-utils.ts` faylında müxtəlif mock funksiyaları yaradılıb
   - ✅ TypeScript və import problemləri həll edilib - relative import path-lar düzgün konfiqurasiya edilib
   - ✅ Vite test konfiqurasiyası yenilənib - path aliasları üçün resolver əlavə edilib

2. **İmplementasiya Mərhələsi (Davam edir)**
   - ✅ Təməl inteqrasiya testləri yaradılıb
   - ✅ Təsdiqlənmə axını inteqrasiya testləri yaradılıb
   - ✅ İstifadəçi rolları və icazələr testləri yaradılıb
   - ⏳ Region-Sektor-Məktəb iyerarxiyası testləri
   - ⏳ Hesabat və analitika testləri

3. **İnteqrasiya və Təsdiqləmə (Davam edir)**
   - ✅ `package.json`-a inteqrasiya testləri üçün xüsusi skriptlər əlavə edilib
   - ✅ İnteqrasiya test sənədləri hazırlanıb və yenilənir
   - ⏳ CI/CD pipeline ilə inteqrasiya
   - ⏳ Test əhatə dairəsi hesabatı

## İnteqrasiya Test Nümunəsi

Aşağıda, İnfoLine üçün inteqrasiya test faylının ssenariyası təqdim edilmişdir. Bu ssenari, məlumat daxiletmə və təsdiqlənməsi prosesi üçün inteqrasiya testinin mümkün implementasiyasını göstərir.

```typescript
describe('INT-05: Məlumat Daxiletmə və Təsdiqlənmə İnteqrasiyası', () => {
  // Test fixture hazırlığı
  beforeAll(async () => {
    // Test üçün region, sektor, məktəb və kateqoriya strukturu hazırlanır
    await setupTestHierarchy();
    // Test istifadəçiləri yaradılır (məktəb admin, sektor admin, region admin)
    await setupTestUsers();
    // Test kateqoriyaları və sütunları yaradılır
    await setupTestCategories();
  });

  describe('INT-05-01: Məlumat daxiletmə və məktəb səviyyəsində göndərmə', () => {
    it('məktəb administratoru məlumatları daxil edib göndərə bilir', async () => {
      // Məktəb admin kimi login
      await loginAsSchoolAdmin();
      
      // Məlumat daxiletmə səhifəsinə keçid
      await navigateToDataEntryPage();
      
      // Məlumatları daxil et
      await fillDataForm({
        category: 'Test Kateqoriya',
        values: {
          'Sütun 1': 'Dəyər 1',
          'Sütun 2': 'Dəyər 2',
          'Sütun 3': 125
        }
      });
      
      // Məlumatları göndər
      await submitData();
      
      // Təsdiq et ki, məlumatlar düzgün saxlanıb və statusu "Göndərilmiş"dir
      const savedData = await fetchSavedData();
      expect(savedData.status).toBe('submitted');
      expect(savedData.values).toMatchObject({
        'Sütun 1': 'Dəyər 1',
        'Sütun 2': 'Dəyər 2',
        'Sütun 3': 125
      });
    });
  });

  describe('INT-05-02: Sektor admin təsdiqləmə prosesi', () => {
    it('sektor administratoru məlumatları yoxlayıb təsdiqləyə bilir', async () => {
      // Sektor admin kimi login
      await loginAsSectorAdmin();
      
      // Təsdiqlənəcək məlumatlar siyahısına keçid
      await navigateToApprovalPage();
      
      // Təsdiqlənəcək məlumatları göstər
      const pendingData = await fetchPendingData();
      expect(pendingData.length).toBeGreaterThan(0);
      
      // Məlumatı seç və təsdiqlə
      await approveData(pendingData[0].id);
      
      // Təsdiq et ki, məlumatın statusu "Sektor tərəfindən təsdiqlənmiş"dir
      const updatedData = await fetchDataById(pendingData[0].id);
      expect(updatedData.status).toBe('sector_approved');
    });
  });

  describe('INT-05-03: Region admin yoxlama və toplama prosesi', () => {
    it('region administratoru məlumatları yoxlayıb təsdiqləyə bilir', async () => {
      // Region admin kimi login
      await loginAsRegionAdmin();
      
      // Təsdiqlənəcək məlumatlar siyahısına keçid
      await navigateToApprovalPage();
      
      // Sektor tərəfindən təsdiqlənmiş məlumatları göstər
      const sectorApprovedData = await fetchSectorApprovedData();
      expect(sectorApprovedData.length).toBeGreaterThan(0);
      
      // Məlumatı seç və təsdiqlə
      await approveData(sectorApprovedData[0].id);
      
      // Təsdiq et ki, məlumatın statusu "Region tərəfindən təsdiqlənmiş"dir
      const updatedData = await fetchDataById(sectorApprovedData[0].id);
      expect(updatedData.status).toBe('region_approved');
    });
  });

  describe('INT-05-04: Məlumatların qaytarılması və yenidən göndərilməsi prosesi', () => {
    it('sektor admin məlumatı geri qaytara bilir və məktəb admin yenidən göndərə bilir', async () => {
      // Sektor admin kimi login
      await loginAsSectorAdmin();
      
      // Təsdiqlənəcək məlumatlar siyahısına keçid
      await navigateToApprovalPage();
      
      // Təsdiqlənəcək məlumatı qaytarmaq
      const pendingData = await fetchPendingData();
      await returnData(pendingData[0].id, 'Düzəliş tələb olunur');
      
      // Təsdiq et ki, məlumatın statusu "Qaytarılmış"dır
      let updatedData = await fetchDataById(pendingData[0].id);
      expect(updatedData.status).toBe('returned');
      
      // Məktəb admin kimi login
      await loginAsSchoolAdmin();
      
      // Qaytarılmış məlumatlar siyahısına keçid
      await navigateToReturnedDataPage();
      
      // Qaytarılmış məlumatı redaktə et
      await editReturnedData(updatedData.id, {
        'Sütun 1': 'Yenilənmiş Dəyər'
      });
      
      // Yenidən göndər
      await resubmitData(updatedData.id);
      
      // Təsdiq et ki, məlumatın statusu yenidən "Göndərilmiş"dir
      updatedData = await fetchDataById(updatedData.id);
      expect(updatedData.status).toBe('submitted');
      expect(updatedData.values['Sütun 1']).toBe('Yenilənmiş Dəyər');
    });
  });

  describe('INT-05-05: Excel import və data validasiyası', () => {
    it('məktəb administrator Excel faylını import edə bilir', async () => {
      // Məktəb admin kimi login
      await loginAsSchoolAdmin();
      
      // Excel import səhifəsinə keçid
      await navigateToExcelImportPage();
      
      // Test Excel faylını seç
      await selectExcelFile('test_data.xlsx');
      
      // İmport et
      await importExcel();
      
      // Təsdiq et ki, məlumatlar düzgün import edilib
      const importedData = await fetchImportedData();
      expect(importedData.length).toBeGreaterThan(0);
      expect(importedData[0].status).toBe('draft');
    });
    
    it('yanlış formatda Excel faylı xəta verir', async () => {
      // Məktəb admin kimi login
      await loginAsSchoolAdmin();
      
      // Excel import səhifəsinə keçid
      await navigateToExcelImportPage();
      
      // Yanlış formatda Excel faylını seç
      await selectExcelFile('invalid_format.xlsx');
      
      // İmport et və xəta gözlə
      const importResult = await importExcel();
      expect(importResult.success).toBe(false);
      expect(importResult.error).toContain('Format xətası');
    });
  });

  // Test mühitinin təmizlənməsi
  afterAll(async () => {
    await cleanupTestData();
    await cleanupTestUsers();
    await cleanupTestHierarchy();
  });
});
```

## İnteqrasiya Testləri Implementasiyası və Utiliti Funksiyalar

### İstifadə Edilən Test Yardımçı Faylı

Inteqrasiya testləri üçün `test-integration-utils.ts` faylı yaradıldı. Bu fayl aşağıdakı əsas komponentləri əhatə edir:

```typescript
// Supabase üçün mock obyekt
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  data: null,
  error: null
};

// İstifadəçi rollarını mock etmək üçün funksiya
export const mockUserRole = (role: UserRole = 'superadmin') => {
  mockUsePermissions.mockReturnValue({
    userRole: role,
    isSuperAdmin: role === 'superadmin',
    isRegionAdmin: role === 'regionadmin',
    isSectorAdmin: role === 'sectoradmin',
    isSchoolAdmin: role === 'schooladmin',
  });
};
```

### Tətbiq Edilmiş Yardımçı Funksiyalar

1. **Test Mühiti və Mock Funksiyaları**:
   - `mockSupabase` - Supabase client üçün mock implementasiya - uğurla tətbiq edilib
   - `mockUsePermissions` - İcazələr hook-u üçün mock - uğurla tətbiq edilib
   - `mockUserRole(role)` - Müxtəlif istifadəçi rollarını simulyasiya etmək üçün - uğurla tətbiq edilib
   - `renderWithProviders` - Komponentləri testlər üçün lazımi kontekstlərlə render edən utility - uğurla tətbiq edilib

2. **Təsdiqləmə Axını Üçün Yardımçı Funksiyalar**:
   - `mockEntryStatus` - Məlumat status dəyişikliklərini simulyasiya etmək üçün - uğurla tətbiq edilib
   - `mockApprovalFlow` - Təsdiqləmə axınını tam simulyasiya edən funksiya - uğurla tətbiq edilib
   - `setupApprovalTest` - Təsdiqləmə test mühitini quran funksiya - uğurla tətbiq edilib

3. **Data Manipulyasiya Funksiyaları**:
   - `createMockEntry` - Mock məlumat yaratmaq üçün - uğurla tətbiq edilib
   - `mockDataEntryOperation` - Məlumat daxiletmə prosesini simulyasiya etmək üçün - uğurla tətbiq edilib

## Qarşılaşdığımız Problemlər və Həllər

İnteqrasiya testlərini implementasiya edərkən aşağıdakı problemlərlə qarşılaşdıq və onları uğurla həll etdik:

### 1. TypeScript və Import Yolları Problemləri

**Problem**: Test faylında `src/@/...` şəklində import yolları düzgün resolv edilmirdi.

**Həll**:
- `vite.config.ts` faylında resolver konfiqurasiya edildi
- Import yolları nisbi yollarla (örnəyin, `../../../components/...`) əvəz edildi
- Lazım olan komponentlər mock komponentlərlə əvəz edildi

### 2. Role-Basəd Permission Testləri

**Problem**: Müxtəlif istifadəçi rollarının müxtəlif tcazələrini test edərkən rol adlarında böyük-kiçik hərf fərqlərindən qaynaqlanan problemlər ortaya çıxdı.

**Həll**:
- `normalizeRole` funksiyası tətbiq edildi ki, rollar standard formata gətirilsin
- Test edilirkən rollar həmə standard formatda müqayisə edildi
- Xüsusi `mockUserRole` funksiyası yaradıldı

### 3. Status Dəyişiklikləri və Asinxron Əməliyyatlar

**Problem**: Təsdiqləmə axınında status dəyişiklikləri test edərkən asinxron əməliyyatların sırası və zamanlaması ilə bağlı problemlər yarandı.

**Həll**:
- Status dəyişiklikləri üçün callback-əsaslı mock yaradıldı
- `waitFor` və `act` funksiyaları istifadə edildi
- `Promise.all()` ilə bütün pending əməliyyatların tamamlanması gözlənildi

### 4. Supabase Mock

**Problem**: Supabase sorğularını və onların cavablarını test mühitində düzgün simulyasiya etmək çətin idi.

**Həll**:
- Fluent API üçün çevik bir mock sistemi tətbiq edildi (from().select()... zincirləri)
- Sorğu nəticələri üçün dynamic cavablar yaradıldı
- CORS problemlərini önləmək üçün Edge Functions mock edildi

## İnteqrasiya Test Fasiləsi

İnteqrasiya testləri ətraflı və vaxt aparan olduğundan, aşağıdakı test fasiləsi prinsipləri tətbiq ediləcək:

1. **Mənfi Testlər**: Hər bir müsbət test ssenarisi üçün ən azı bir mənfi test ssenarisi yaradılacaq
2. **Kritik Axınlar**: Tətbiqin əsas funksionallığı ilə əlaqəli bütün kritik iş axınları üçün inteqrasiya testləri yazılacaq
3. **Edge Hallar**: Sistem daxilində xüsusi vəziyyətlər, iyerarxik əlaqələr və istifadəçi rollarının kəsişməsi üçün xüsusi testlər yaradılacaq

## Yüksək Səviyyəli Test Metriklərinin İzlənməsi

İnteqrasiya testlərinin effektivliyini ölçmək üçün aşağıdakı metrikləri izləyəcəyik:

1. **Test Əhatə Dairəsi**: Bütün əsas iş axınları üçün inteqrasiya testləri yazılacaq
2. **Test Etibarlılığı**: Testlərin davamlı olaraq eyni nəticələri vermə faizi
3. **Xəta Aşkarlanması**: İnteqrasiya testləri vasitəsilə aşkar edilən xətaların sayı
4. **Test İcra Müddəti**: İnteqrasiya testlərinin icra müddəti (testlərin effektivliyini artırmaq üçün)

## Nəticə

Bu inteqrasiya test strategiyası, İnfoLine tətbiqinin müxtəlif modulları və komponentlərinin birlikdə düzgün işlədiyini təmin etmək üçün ətraflı bir plan təqdim edir. Bu strategiyanın tətbiqi ilə, tətbiqin etibarlılığını və stabilliyini artırmaq mümkün olacaq.
