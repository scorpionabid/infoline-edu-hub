
# İnfoLine - Məktəb Məlumatları Toplama Sistemi
## Tətbiq Tələbləri Sənədi (Lovable.dev üçün)

## 1. LAYİHƏ XÜLASƏSİ

İnfoLine tətbiqi, Azərbaycanda məktəblərdən statistik məlumatların toplanması, analizi və hesabatlandırılması üçün nəzərdə tutulmuş mərkəzləşdirilmiş veb platformadır. Bu tətbiq SuperAdmin, Region adminləri, Sektor adminləri və Məktəb adminləri kimi 4 əsas rol üçün fərdiləşdirilmiş interfeyslər təmin edir.

**Ölçək**: 600+ məktəbi əhatə edəcək.
**Dil dəstəyi**: Azərbaycan, Rus, Türk, İngilis.

## 2. İSTİFADƏÇİ ROLLARI

### 2.1. SuperAdmin
SuperAdmin bütün sistemin idarəsini həyata keçirir:
- Regionları və Region adminlərini yaratma, silmə, redaktə etmə
- Sektorları və Sektor adminlərini yaratma, silmə, redaktə etmə
- Məktəbləri və Məktəb adminlərini yaratma, silmə, redaktə etmə
- Kateqoriyaları və sütunları yaratma, redaktə etmə, silmə
- Sistemin ümumi konfigurasiyası
- Bütün istifadəçilərin səlahiyyətlərini idarə etmə
- Məlumatların sıfırlanması
- Toplu məlumat idxalı və ixracı

### 2.2. Region Admini
Region Admini öz regionu daxilində SuperAdmin-ə bənzər səlahiyyətlərə malikdir:
- Regiona aid sektorları və Sektor adminlərini idarə etmə
- Regiona aid məktəbləri və Məktəb adminlərini idarə etmə
- Region daxilində kateqoriyaları və sütunları idarə etmə
- Region məlumatlarının analizi və hesabatlandırılması
- Region daxilində məlumatları sıfırlama
- Toplu məlumat idxalı və ixracı (region daxilində)

### 2.3. Sektor Admini
Sektor Admini öz sektoru daxilində məlumatları idarə edir:
- Sektora aid məktəbləri və Məktəb adminlərini idarə etmə
- Məktəb adminləri tərəfindən daxil edilən məlumatları təsdiqləmə
- Sektor daxilində məlumatların analizi və ixracı
- Məlumat daxil etməyən məktəblərə bildirişlər göndərmə

### 2.4. Məktəb Admini
Məktəb Admini məlumatların ilkin daxil edilməsini həyata keçirir:
- Kateqoriyalara uyğun məlumatları sütunlarada sətirlərə daxil etmə
- Məlumatları redaktə etmə (təsdiqlənənə qədər)
- Excel vasitəsilə məlumatları toplu şəkildə yükləmə

## 3. SİSTEM FUNKSİONALLIĞI

### 3.1. Authentication və Authorization
- Çoxsəviyyəli, rol-əsaslı giriş sistemi
- Şifrə bərpa mexanizmi
- Aktivlik tarixçəsinin izlənməsi

### 3.2. Təşkilati Struktur İdarəetməsi
- Region -> Sektor -> Məktəb iyerarxiyasının idarə edilməsi
- Excel vasitəsilə toplu məktəb və admin yükləmə imkanı
- İstifadəçi rollarının və səlahiyyətlərinin təyin edilməsi

### 3.3. Məlumat Strukturu İdarəetməsi
- Dinamik kateqoriya və sütun yaratma
- Kateqoriyaların təyinatının seçilməsi ("All" və "Sectors")
- Sütun tiplərinin konfiqurasiyası (mətn, rəqəm, tarix, seçim)
- Data limitləri və validasiya qaydalarının müəyyən edilməsi
- Məcburi sahələrin təyin edilməsi
- Son tarix konfiqurasiyası

### 3.4. Məlumat Daxil etmə və idarəetmə
- Microsoft Forms üslubunda interfeys (məktəb adminləri üçün)
- Excel şablonlarının yaradılması və istifadəsi
- Toplu məlumat idxalı və ixracı
- Məlumatların validasiyası
- Təsdiq və redaktə prosesi
- Dəyişikliklərin tarixçəsinin izlənməsi

### 3.5. Bildiriş Sistemi
- Daxili bildirişlər və email bildirişləri
- Son tarix xəbərdarlıqları
- Məlumat daxil etmə xatırlatmaları
- Təsdiq və redaktə bildirişləri
- Bildiriş parametrlərinin konfiqurasiyası

### 3.6. Hesabat və Analitika
- Fərdiləşdirilmiş dashboardlar hər rol üçün
- Filtirləmə və axtarış funksiyaları
- Excel formatında hesabat ixracı
- Vizual analizlər və qrafiklər
- Hesabat şablonlarının yaradılması və saxlanması

### 3.7. Arxivləşdirmə və Versiya Nəzarəti
- Məlumat dəyişikliklərinin tarixçəsi
- Silinmiş elementlərin arxivləşdirilməsi
- 30 günlük saxlama müddəti
- Versiya bərpası funksiyası
### 3.8. Link İdarəetməsi və Fayl İdarəetməsi
- RegionAdmin və SectorAdmin-lər məktəblərə linklər və fayllar göndərə bilər
- Məktəblər üçün strukturlaşdırılmış fayl qovluq sistemi (Sənədlər, Hesabatlar, Şəkillər, Digər)
- SchoolAdmin-lər göndərilmiş linklər və fayllardan istifadə edə bilər
- Fayl yükləmə, endirmə və izləmə imkanları

## 4. İNTERFEYS TƏLƏBLƏRİ

### 4.1. Ümumi Tələblər
- Responsive dizayn (desktop və mobil uyğunluq)
- Çoxdilli interfeys (Azərbaycan, Rus, Türk, İngilis)
- İntuisiyalı naviqasiya və istifadəçi dostu təcrübə
- Rol-əsaslı görünüş adaptasiyası
- Accessibility standartlarına uyğunluq

### 4.2. SuperAdmin Dashboard
- Sistem statistikası və ümumi məlumatlar
- Region, sektor və məktəb idarəetmə paneli
- Kateqoriya və sütun yaratma interfeysi
- İstifadəçi idarəetmə paneli
- Sistem konfiqurasiyası ayarları

### 4.3. Region Admini Dashboard
- Region statistikası və məlumatları
- Sektor və məktəblərin idarəetmə paneli
- Region kateqoriyaları və sütunları
- Region məlumatlarının analizi və hesabatları

### 4.4. Sektor Admini Dashboard
- Sektor statistikası
- Məktəb məlumatlarının izlənməsi
- Doldurulma faizi göstəriciləri
- Təsdiq gözləyən məlumatlar paneli
- Məlumatların analizi və hesabatları

### 4.5. Məktəb Admini Dashboard
- Doldurulması tələb olunan məlumatlar siyahısı
- Son tarixlər və vaxt göstəriciləri
- Microsoft Forms üslubunda məlumat daxil etmə interfeysi
- Təsdiq statuslarının izlənməsi
- Bildirişlər paneli

## 5. TEXNİKİ TƏLƏBLƏR

### 5.1. Performans
- 1 saniyədən az səhifə yüklənmə vaxtı
- Eyni anda 100+ istifadəçi ilə işləmə qabiliyyəti
- 10,000+ sətirlik Excel idxalı/ixracı dəstəyi
- Son müddət günlərində yüksək yüklənmə zamanı stabil işləmə

### 5.2. Təhlükəsizlik
- HTTPS protokolu
- CSRF müdafiəsi
- Təhlükəsizlik auditi və izləmə

### 5.3. Verilənlər Bazası
- Relational verilənlər bazası strukturu
- İndexləmə və performans optimallaşdırması
- Transactional əməliyyatlar
- Backup və recovery prosedurları

### 5.4. Keşləmə və Optimallaşdırma
- Server-side və client-side keşləmə
- CDN inteqrasiyası
- Statik resursların optimallaşdırılması
- API çağırışlarının optimallaşdırılması

## 6. DATA STRUKTURU

### 6.1. Kateqoriyalar
Kateqoriya məlumatları qruplaşdırmaq üçün istifadə olunur:
- ID
- Ad
- Təyinat (All/Sectors) - təyinat müəyyən edir ki, bu kateqoriya bütün istifadəçilər, yoxsa yalnız sektorlar tərəfindən görünəcək
- Yaradılma tarixi
- Son yenilənmə tarixi
- Status (aktiv/deaktiv)
- Arxivləşdirmə statusu
- Prioritet sırası

### 6.2. Sütunlar
Hər bir kateqoriya daxilində sütunlar yaradılır:
- ID
- Kateqoriya ID
- Ad
- Tip (mətn, rəqəm, tarix, seçim, checkbox, radio, fayl, şəkil və s.)
- Validasiya qaydaları (min/max value, data limiti, format, regex və s.)
- Məcburilik statusu (required/optional)
- Default dəyər (varsa)
- Seçim variantları (seçim tipi üçün)
- Placeholder text
- Köməkçi mətn
- Son tarix (varsa)
- Sıra nömrəsi
- Parent sütun ID (asılılıq münasibətləri üçün)
- Şərtli göstərmə qaydaları
- Status (aktiv/deaktiv)

### 6.3. İstifadəçilər
Sistemdəki bütün istifadəçilər:
- ID
- Ad, Soyad
- E-mail
- Telefon
- Şifrə (hash edilmiş)
- Rol (SuperAdmin, Region Admin, Sektor Admin, Məktəb Admin)
- Region ID (əgər varsa)
- Sektor ID (əgər varsa)
- Məktəb ID (əgər varsa)
- Status (aktiv/deaktiv/bloklanmış)
- Sonuncu giriş tarixi
- Şifrə dəyişmə tarixi
- 2FA aktivasiya statusu
- Dil seçimi
- Bildiriş parametrləri
- Avatar/profil şəkli
- Yaradılma tarixi
- Son yenilənmə tarixi

### 6.4. Məlumatlar
İstifadəçilər tərəfindən daxil edilən məlumatlar:
- ID
- Kateqoriya ID
- Sütun ID
- Məktəb ID
- Dəyər
- Status (Gözləmədə, Təsdiqlənmiş, Rədd edilmiş)
- Yaradılma tarixi
- Son yenilənmə tarixi
- Daxil edən istifadəçi ID
- Təsdiqlənmə tarixi (əgər təsdiqlənibsə)
- Təsdiqləyən istifadəçi ID (əgər təsdiqlənibsə)
- Rədd etmə səbəbi (əgər rədd edilibsə)
- Rədd edən istifadəçi ID (əgər rədd edilibsə)
- Version history ID

### 6.5. Regionlar
Sistemdəki regionlar:
- ID
- Ad
- Təsvir
- Yaradılma tarixi
- Status (aktiv/deaktiv)
- Əhatə dairəsi (məktəb sayı)

### 6.6. Sektorlar
Sistemdəki sektorlar:
- ID
- Region ID
- Ad
- Təsvir
- Yaradılma tarixi
- Status (aktiv/deaktiv)
- Əhatə dairəsi (məktəb sayı)

### 6.7. Məktəblər
Sistemdəki məktəblər:
- ID
- Sektor ID
- Region ID
- Ad
- Ünvan
- Əlaqə məlumatları (telefon, e-mail və s.)
- Direktor məlumatları
- Şagird sayı
- Müəllim sayı
- Məktəb növü (tam orta, ümumi orta və s.)
- Tədris dili
- Yaradılma tarixi
- Status (aktiv/deaktiv)

### 6.8. Bildirişlər
Sistem tərəfindən yaradılan bildirişlər:
- ID
- Növ (yeni kateqoriya, son tarix, təsdiq və s.)
- Başlıq
- Mətn
- İstifadəçi ID (kimə göndərilib)
- Yaradılma tarixi
- Oxu statusu
- Prioritet (normal, yüksək, kritik)
- Əlaqəli element ID (kateqoriya, sütun, məlumat və s.)
- Əlaqəli element tipi

### 6.9. Tarixçə və Audit Logs
Sistemdə edilən dəyişikliklərin tarixçəsi:
- ID
- Əməliyyat tipi (yaratma, redaktə, silmə, təsdiq və s.)
- Əməliyyat tarixi
- İstifadəçi ID (kim tərəfindən edilib)
- Element tipi (kateqoriya, sütun, məlumat və s.)
- Element ID
- Əvvəlki dəyər
- Yeni dəyər
- IP ünvan
- User agent məlumatı

## 7. İŞ AXINI

### 7.1. Məlumat Daxil Etmə Prosesi
1. SuperAdmin/Region admini kateqoriya və sütunları yaradır
2. SuperAdmin/Region admini son tarixləri təyin edir
3. Məktəb admini daxil etmə interfeysi vasitəsilə və ya Excel şablonu ilə məlumatları doldurur
4. Məktəb admini məlumatları təsdiq üçün göndərir (save)
5. Daxil edilmiş məlumatlar "Gözləmədə" statusu alır
6. Sektor admini və ya Region admini məlumatları nəzərdən keçirir
7. Sektor/Region admini məlumatları təsdiqləyir və ya rədd edir
8. Təsdiqlənən məlumatlar "Təsdiqlənmiş" statusu alır və daha məktəb admini tərəfindən dəyişdirilə bilməz
9. Rədd edilən məlumatlar "Rədd edilmiş" statusu alır və məktəb admininə səbəbi ilə birlikdə qaytarılır
10. Son tarix çatdıqda, bütün təsdiqlənməmiş məlumatlar avtomatik təsdiqlənir

### 7.2. Excel İmport Prosesi
1. İstifadəçi "Excel ilə İmport" funksiyasını seçir
2. Sistem mövcud template-i yükləmək və ya yeni yaratmaq imkanı verir
3. İstifadəçi template-i doldurur və yükləyir
4. Sistem məlumatları validasiya edir və xətaları bildirir
5. Validasiya uğurlu olduqda, məlumatlar sistemə yüklənir
6. Yüklənmiş məlumatlar "Gözləmədə" statusu alır (məktəb admini yüklədikdə)

### 7.3. Təsdiq Prosesi
1. Sektor/Region admini təsdiq gözləyən məlumatları dashboard-da görür
2. Məlumatları nəzərdən keçirir
3. Düzgün məlumatları təsdiqləyir
4. Səhv və ya natamam məlumatları rədd edir
5. Rədd etmə səbəbini daxil edir
6. Sistem müvafiq bildirişləri göndərir

## 8. BİLDİRİŞ SİSTEMİ

### 8.1. Bildiriş Növləri
- Yeni kateqoriya və ya sütun bildirişləri
- Son tarix xəbərdarlıqları (3 gün, 1 gün qalmış)
- Məlumat daxil edilməmiş sütunlar barədə xəbərdarlıqlar
- Təsdiq və rədd bildirişləri
- Sistem yenilikləri haqqında bildirişlər

### 8.2. Bildiriş Kanalları
- Sistem daxili bildirişlər (oxu statusu ilə)
- E-mail bildirişləri
- Bildiriş panelidə göstərilən xəbərdarlıqlar

## 9. HESABAT VƏ ANALİTİKA

### 9.1. Hesabat Növləri
- Məlumat doldurulma statistikası (məktəb, sektor və region səviyyəsində)
- Vaxtında təqdim edilən və gecikdirilən məlumatlar
- Seçilmiş kateqoriya üzrə ümumi məlumatlar
- Müqayisəli analizlər (məktəb, sektor, region arasında)
- Vaxt seriyası analizi (dövr üzrə məlumatların dəyişməsi)

### 9.2. Export Formatları
- Excel (.xlsx)
- PDF
- CSV

## 10. ARXİVLƏŞDİRMƏ VƏ DATA İDARƏETMƏSİ

### 10.1. Arxivləşdirmə Prosesi
- Silinən elementlər (kateqoriya, sütun, məktəb və s.) avtomatik arxivləşdirilir
- Arxivləşdirilmiş elementlər 30 gün ərzində bərpa edilə bilər
- 30 gün sonra tam silinmə xəbərdarlığı göndərilir
- Təsdiqlənmiş tam silinmə prosesi həyata keçirilir

### 10.2. Məlumatların Sıfırlanması
- SuperAdmin və Region admin məlumatları sıfırlaya bilər
- Sıfırlama əməliyyatı təsdiq tələb edir
- Sıfırlanmış məlumatların tarixçəsi saxlanılır
- Sıfırlama əməliyyatı audit logda qeydə alınır

### 10.3. Versiya Nəzarəti
- Bütün məlumat dəyişiklikləri tarixçəsi saxlanılır
- Hər dəyişiklik üçün tarix, istifadəçi və dəyişiklik məzmunu qeyd edilir
- Köhnə versiyaya qayıtma funksionallığı mövcuddur

## 11. MOBİL UYĞUNLUQ

- Bütün dashboardlar və interfeys mobil cihazlara adaptasiya olunmalıdır
- Touch-optimized interfeys elementləri
- Məlumat daxil etmə və izləmə prosesi mobil cihazlarda mümkün olmalıdır
- Bildirişlər mobil cihazlarda real-vaxt rejimində əlçatan olmalıdır

## 12. DİL DƏSTƏYİ

- İnterfeys 4 dildə təqdim ediləcək: Azərbaycan, Rus, Türk, İngilis
- Dil seçimi profil ayarlarında və login səhifəsində əlçatan olmalıdır
- Bütün bildirişlər, xəbərdarlıqlar və sistem mesajları seçilmiş dildə göstəriləcək

## 13. SISTEM ƏHATƏSI

### Daxil olanlar
- Veb tətbiq (responsive dizaynla)
- Admin panellər (4 rol üçün)
- Hesabat və analitika modulları
- Excel import/export funksionallığı
- Bildiriş sistemi

### Xaric olanlar
- Mobil xüsusi tətbiq (veb tətbiq adaptiv olacaq)
- Offline tam funksionallıq (əsas funksiyalar üçün offline dəstək olacaq)
- Tədrisi idarəetmə sistemləri ilə tam inteqrasiya

## 14. PROQRAM TƏMİNATI TƏLƏBLƏRİ

- Veb brauzerlər: Chrome, Firefox, Safari, Edge (son 2 versiya)
- Excel import/export üçün Microsoft Excel və ya LibreOffice dəstəyi
- E-mail bildirişləri üçün standart e-mail client dəstəyi
- PDF hesabatları üçün PDF reader dəstəyi

## 15. PERFORMANCE KRİTERİYALARI

- Səhifə yüklənmə vaxtı: 1 saniyədən az
- Excel import/export əməliyyatları: 10,000 sətir 30 saniyədən az
- Axtarış sorğu cavab vaxtı: 500 millisaniyədən az
- Eyni anda istifadəçi sayı: minimum 100 aktiv istifadəçi
- Uptime: 99.9% (ayda maksimum 43 dəqiqə dayanma)
