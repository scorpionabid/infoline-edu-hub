# İnfoLine Test Strategiyası

## Ümumi Məlumat

Bu sənəd, İnfoLine proyektinin test strategiyasını və test planını təqdim edir. Sənəd, müxtəlif funksional sahələri əhatə edən geniş test ssenarilərini, mock strategiyasını və implementasiya planını əhatə edir.

## Test Sahələri

### 1. Autentifikasiya Testləri
**Test Fayl:** `auth.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| AUTH-01 | Giriş prosesi | Email və şifrə ilə giriş prosesini test edir | İstifadəçi uğurla daxil olmalı və dashboard-a yönləndirilməlidir | Yüksək | 
| AUTH-02 | Yanlış giriş məlumatları | Yanlış email/şifrə ilə giriş cəhdi | Müvafiq xəta mesajı göstərilməlidir | Yüksək | 
| AUTH-03 | Çıxış prosesi | İstifadəçinin sistemdən çıxış prosesi | İstifadəçi login səhifəsinə yönləndirilməlidir | Orta | 
| AUTH-04 | Sessiya saxlama | Səhifə yenilənəndə sessiyanın saxlanması | İstifadəçi sessiyası qorunmalıdır | Orta | 
| AUTH-05 | Şifrəni unutma | Şifrəni sıfırlama prosesi | İstifadəçi şifrəni yeniləyə bilməlidir | Aşağı |

### 2. Dashboard Yönləndirmə Testləri
**Test Fayl:** `dashboard-navigation.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| DASH-01 | İcazəli yönləndirmə | İstifadəçi roluna uyğun dashboard-a yönləndirmə | Müvafiq dashboard göstərilməlidir | Yüksək | 
| DASH-02 | Yan panel naviqasiyası | Yan paneldən müxtəlif bölmələrə keçid | Müvafiq bölmə yüklənməlidir | Orta | 
| DASH-03 | Responsiv görünüş | Müxtəlif ekran ölçüləri üçün responsivlik | Mobil və desktop görünüşü düzgün işləməlidir | Orta | 
| DASH-04 | İcazəsiz bölmələr | İcazəsi olmayan bölmələrə keçid cəhdi | İcazə olmadığı mesajı göstərilməlidir | Orta |

### 3. İstifadəçi İdarəetməsi Testləri
**Test Fayl:** `user-management.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| USER-01 | İstifadəçi yaratma | Yeni istifadəçi yaratma prosesi | İstifadəçi uğurla yaradılmalıdır | Yüksək | 
| USER-02 | İstifadəçi rolu təyin etmə | İstifadəçiyə rol təyin etmə | İstifadəçi rolu müvəffəqiyyətlə təyin edilməlidir | Yüksək | 
| USER-03 | İstifadəçi redaktəsi | Mövcud istifadəçinin məlumatlarını redaktə etmə | Dəyişikliklər saxlanmalıdır | Orta | 
| USER-04 | İstifadəçi silmə | İstifadəçini silmə prosesi | İstifadəçi uğurla silinməlidir | Orta | 
| USER-05 | İstifadəçi siyahısı | İstifadəçilərin siyahısının yüklənməsi | Siyahı düzgün yüklənməlidir | Orta | 
| USER-06 | İstifadəçi filtrasiyası | Müxtəlif parametrlərə görə filtrasiya | Filtrlər düzgün işləməlidir | Aşağı |

### 4. Region/Sektor/Məktəb İdarəetməsi
**Test Fayl:** `hierarchy-management.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| HIER-01 | Region yaratma | Yeni region yaratma prosesi | Region uğurla yaradılmalıdır | Yüksək | 
| HIER-02 | Sektor yaratma | Yeni sektor yaratma prosesi | Sektor uğurla yaradılmalıdır | Yüksək | 
| HIER-03 | Məktəb yaratma | Yeni məktəb yaratma prosesi | Məktəb uğurla yaradılmalıdır | Yüksək | 
| HIER-04 | Region admin təyin etmə | Regiona admin təyin etmə | Admin uğurla təyin edilməlidir | Orta | 
| HIER-05 | Sektor admin təyin etmə | Sektora admin təyin etmə | Admin uğurla təyin edilməlidir | Orta | 
| HIER-06 | Məktəb admin təyin etmə | Məktəbə admin təyin etmə | Admin uğurla təyin edilməlidir | Orta | 
| HIER-07 | İyerarxiya əlaqələri | Region-sektor-məktəb əlaqələrinin yoxlanması | Əlaqələr düzgün qurulmalıdır | Orta |

### 5. Kateqoriya və Sütun İdarəetməsi
**Test Fayl:** `category-column.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| CAT-01 | Kateqoriya yaratma | Yeni kateqoriya yaratma prosesi | Kateqoriya uğurla yaradılmalıdır | Yüksək | 
| CAT-02 | Sütun yaratma | Kateqoriyaya yeni sütun əlavə etmə | Sütun uğurla əlavə edilməlidir | Yüksək | 
| CAT-03 | Sütun tipi seçimi | Müxtəlif tip sütunlar yaratma | Müxtəlif tip sütunlar düzgün işləməlidir | Orta | 
| CAT-04 | Kateqoriya redaktəsi | Mövcud kateqoriyanı redaktə etmə | Dəyişikliklər saxlanmalıdır | Orta | 
| CAT-05 | Sütun redaktəsi | Mövcud sütunu redaktə etmə | Dəyişikliklər saxlanmalıdır | Orta | 
| CAT-06 | Sütun sıralaması | Sütunları sürükləyib yenidən sıralama | Sıralama saxlanmalıdır | Aşağı | 
| CAT-07 | Kateqoriya/sütun silmə | Kateqoriya və sütun silmə prosesi | Elementlər uğurla silinməlidir | Orta |

### 6. Məlumat Daxiletmə və Import
**Test Fayl:** `data-entry.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| DATA-01 | Manuel məlumat daxiletmə | Formlara məlumat daxil etmə prosesi | Məlumatlar uğurla saxlanmalıdır | Yüksək | 
| DATA-02 | Excel faylı import | Excel faylından məlumat import etmə | Məlumatlar uğurla import edilməlidir | Yüksək | 
| DATA-03 | Import xətaları | Yanlış formatda Excel import etmə | Müvafiq xəta mesajları göstərilməlidir | Orta | 
| DATA-04 | Məlumat validasiyası | Daxil edilən məlumatların validasiyası | Validasiya qaydaları işləməlidir | Orta | 
| DATA-05 | Məlumat redaktəsi | Mövcud məlumatları redaktə etmə | Dəyişikliklər saxlanmalıdır | Orta | 
| DATA-06 | Məlumat silmə | Daxil edilmiş məlumatları silmə | Məlumatlar uğurla silinməlidir | Orta |

### 7. Məlumat Təsdiqi və Toplama
**Test Fayl:** `data-approval.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| APPR-01 | Məlumat təsdiqi (məktəb admin) | Məktəb admin tərəfindən məlumat təsdiqi | Məlumat statusu dəyişməlidir | Yüksək | 
| APPR-02 | Məlumat təsdiqi (sektor admin) | Sektor admin tərəfindən məlumat təsdiqi | Məlumat statusu dəyişməlidir | Yüksək | 
| APPR-03 | Məlumat təsdiqi (region admin) | Region admin tərəfindən məlumat təsdiqi | Məlumat statusu dəyişməlidir | Yüksək | 
| APPR-04 | Məlumat qaytarma | Məlumatı düzəliş üçün qaytarma | Məlumat statusu "düzəliş tələb olunur" olmalıdır | Orta | 
| APPR-05 | Statuslar üzrə filtrasiya | Müxtəlif təsdiq statusları üzrə filtrasiya | Filtrlər düzgün işləməlidir | Orta | 
| APPR-06 | Toplu təsdiq | Birdən çox məlumatı eyni anda təsdiq etmə | Bütün seçilmiş məlumatlar təsdiqlənməlidir | Aşağı |

### 8. Hesabat və Statistika
**Test Fayl:** `reporting.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| REP-01 | Hesabat generasiyası | Müxtəlif parametrlərlə hesabat yaratma | Hesabat uğurla yaradılmalıdır | Yüksək | 
| REP-02 | Excel export | Hesabatları Excel formatında export etmə | Excel faylı düzgün formatda yaradılmalıdır | Orta | 
| REP-03 | PDF export | Hesabatları PDF formatında export etmə | PDF faylı düzgün formatda yaradılmalıdır | Orta | 
| REP-04 | Qrafik statistika | Qrafik statistikanın düzgün göstərilməsi | Qrafiklər düzgün məlumatlarla göstərilməlidir | Orta | 
| REP-05 | Hesabat filtrasiyası | Müxtəlif parametrlərə görə hesabat filtrasiyası | Filtrlər düzgün işləməlidir | Aşağı |

### 9. İnteqrasiya Testləri
**Test Fayl:** `integration.test.tsx`

| Test ID | Test Adı | Təsvir | Gözlənilən Nəticə | Prioritet |
|---------|----------|--------|-------------------|-----------| 
| INT-01 | Login-Dashboard prosesi | Login olub dashboard-da işləmə prosesi | Bütün keçidlər uğurlu olmalıdır | Yüksək | 
| INT-02 | Kateqoriya-sütun-data zənciri | Kateqoriya və sütun yaradıb, data daxil etmə zənciri | Bütün proseslər uğurla tamamlanmalıdır | Yüksək | 
| INT-03 | Data-Təsdiq-Hesabat zənciri | Data daxil edib, təsdiqləyib, hesabat alma zənciri | Bütün proseslər uğurla tamamlanmalıdır | Orta | 
| INT-04 | Region-Sektor-Məktəb-Admin zənciri | İyerarxiya yaradıb, adminlər təyin etmə zənciri | Bütün proseslər uğurla tamamlanmalıdır | Orta |

## Test İmplementasiyası Üçün Tövsiyələr

### Mock Strategiyası:

```typescript
// Supabase mock nümunəsi
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } }, error: null }),
      // digər mock funksiyalar...
    },
    // digər mock funksiyalar...
  }
}));
```

### Test Komponentləri:

```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LanguageProvider>
          {ui}
        </LanguageProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};
```

### Rola Əsaslanan Test:

```typescript
const mockUserRole = (role: UserRole = 'superadmin') => {
  vi.spyOn(PermissionsHook, 'usePermissions').mockReturnValue({
    userRole: role,
    isAdmin: true,
    isSuperAdmin: role === 'superadmin',
    // digər xüsusiyyətlər...
  });
};
```

## Test Statusu və Tamamlanmış İşlər

### Ümumi Test Vasitələri və İnfrastruktur

| Təsvir | Fayl | Status |
|---------|------|--------|
| Ümumi test vasitələri və yardımçı funksiyalar | `src/__tests__/test-utils.tsx` | **Tamamlanmış** |
| Test setup konfiqurasiyaları | `src/setupTests.tsx` | **Tamamlanmış** |

### Test Komponentləri və Təkrar İstifadə Strukturı

Aşağıdakı test funksiyaları tamamlanmış və təkrar istifadə üçün hazırdır:

- `renderWithProviders()` - Testlərdə istifadə edilən ortaq mühiti təmin edir
- `mockSupabase()` - Supabase sorğularını simulyasiya etmək üçün
- `mockUserRole()` - İstifadəçi rollarını simulyasiya etmək üçün 
- `mockEdgeFunctions()` - Edge Functions sorğularını simulyasiya etmək üçün
- `mockAuthStore()` - Autentifikasiya vəziyyətini simulyasiya etmək üçün
- `mockStorage()` - Lokal saxlama funksionallığını simulyasiya etmək üçün

## İmplementasiya Plan və Status Cədvəli

| Mərhələ | Prioritet | Status | Tamamlanmış Fayl(lar) | Qalan İşlər |
|---------|-----------|-------|-------------------|-------------|
| Autentifikasiya testləri | Yüksək | **Qismən Tamamlanmış** | `login.test.tsx`, `LoginForm.test.tsx`, `auth.test.tsx` | Şifrəni sıfırlama, JWT token dinamik yoxlamaları |
| Dashboard və yönləndirmə testləri | Yüksək | **Qismən Tamamlanmış** | `dashboard-navigation.test.tsx` | Sidebar komponentinə dəqiq testlər, rol əsaslı navigasiya |
| İstifadəçi idarəetmə testləri | Yüksək | **Qismən Tamamlanmış** | `user-management.test.tsx` | İstifadəçi yaratma UI testləri, rol dəyişdirmə |
| Region/Sektor/Məktəb idarəetmə testləri | Orta | Başlanmayıb | - | Bütün testlər planlanmalıdır |
| Kateqoriya və sütun idarəetmə testləri | Orta | Başlanmayıb | - | Bütün testlər planlanmalıdır |
| Məlumat daxiletmə və import testləri | Yüksək | Başlanmayıb | - | Bütün testlər planlanmalıdır |
| Məlumat təsdiqi və toplama testləri | Orta | Başlanmayıb | - | Bütün testlər planlanmalıdır |
| Hesabat və statistika testləri | Aşağı | Başlanmayıb | - | Bütün testlər planlanmalıdır |
| İnteqrasiya testləri | Yüksək | Başlanmayıb | - | Bütün testlər planlanmalıdır |
