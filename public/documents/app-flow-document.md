# App Flow Document: İnfoLine - Məktəb Məlumatları Toplama Sistemi

## 1. Ümumi Axın Diaqramı

İnfoLine tətbiqinin əsas istifadəçi axını aşağıdakı diaqramla təsvir olunur:

```
┌───────────────┐       ┌────────────────┐       ┌───────────────────┐
│  Giriş Səhifəsi │ ───► │ Autentifikasiya │ ───► │ Rol-əsaslı Dashboard │
└───────────────┘       └────────────────┘       └───────────────────┘
                                                          │
                                                          ▼
┌────────────────────┐       ┌─────────────────┐       ┌───────────────┐
│ Hesabat və Analitika │ ◄─── │ Məlumat İdarəetməsi │ ◄─── │ Admin Panelləri │
└────────────────────┘       └─────────────────┘       └───────────────┘
```

## 2. Giriş və Autentifikasiya Axını

### 2.1. İstifadəçi Girişi

1. İstifadəçi login səhifəsinə daxil olur
2. E-poçt və şifrə daxil edir
3. Sistemə giriş düyməsinə basır
4. Supabase.auth.signInWithPassword() çağırılır
5. Giriş uğurludursa, JWT token yaradılır və local storage-da saxlanılır
6. İstifadəçi roluna əsasən müvafiq dashboard-a yönləndirilir

```
İstifadəçi ──► Giriş məlumatlarını daxil edir ──► Sistem doğrulayır ──┬─► Uğurlu: Dashboard-a yönləndirilir
                                                                      └─► Uğursuz: Xəta bildirişi göstərilir
```

### 2.2. Şifrənin Bərpası

1. İstifadəçi "Şifrəni unutmuşam" keçidinə basır
2. E-poçt ünvanını daxil edir
3. "Şifrə sıfırlama linki göndər" düyməsinə basır
4. Supabase.auth.resetPasswordForEmail() çağırılır
5. E-poçt ünvanına sıfırlama linki göndərilir
6. İstifadəçi e-poçtundakı linkə basır
7. Şifrə yeniləmə səhifəsinə yönləndirilir
8. Yeni şifrə daxil edir və təsdiqləyir
9. Supabase.auth.updateUser() çağırılır
10. Şifrə yenilənir və login səhifəsinə yönləndirilir

### 2.3. İlk Dəfə Giriş (Yeni Təyin Edilmiş Admin)

1. SuperAdmin yeni RegionAdmin yaradır 
2. Yeni RegionAdmini regiona təyin edir və e-poçtuna hesab və parolunu göndərilir.
3. Yeni RegionAdmin admin link vasitəsilə platformaya daxil olur
4. RegionAdmin şəxsi məlumatlarını tamamlayır. və digər adminləri yaradır və müvafiq olaraq sektoralara və ya məktəblərə təyin edir. 

5. Giriş tamamlanır və müvafiq dashboard-a yönləndirilir

## 3. Rol-əsaslı Dashboard Axını

### 3.1. SuperAdmin Dashboard

1. SuperAdmin girişdən sonra SuperAdmin dashboard-a yönləndirilir
2. Dashboard-da ümumi statistikalar göstərilir:
   - Ümumi regionlar, sektorlar və məktəblər sayı
   - Tamamlanma faizi (məlumat doldurulma) statistikası
   - Son aktivliklər
   - Gözləyən təsdiqlər və problemlər

3. SuperAdmin aşağıdakı əsas seksiyalara daxil ola bilər:
   - Region İdarəetməsi
   - Sektor İdarəetməsi
   - Məktəb İdarəetməsi
   - Kateqoriya və Sütun İdarəetməsi
   - İstifadəçi İdarəetməsi
   - Sistem Konfiqurasiyası
   - Hesabat və Analitika

```
SuperAdmin Dashboard ──┬─► Region İdarəetməsi ──► Region Əlavə/Silmə/Redaktə
                       │
                       ├─► Sektor İdarəetməsi ──► Sektor Əlavə/Silmə/Redaktə
                       │
                       ├─► Məktəb İdarəetməsi ──► Məktəb Əlavə/Silmə/Redaktə
                       │
                       ├─► Kateqoriya İdarəetməsi ──► Kateqoriya Əlavə/Silmə/Redaktə
                       │
                       ├─► İstifadəçi İdarəetməsi ──► İstifadəçi Əlavə/Silmə/Redaktə
                       │
                       └─► Hesabat və Analitika ──► Hesabat Yaratma/İxrac
```

### 3.2. RegionAdmin Dashboard

1. RegionAdmin girişdən sonra Region Admin dashboard-a yönləndirilir
2. Dashboard-da region statistikaları göstərilir:
   - Region üzrə sektorlar və məktəblər sayı
   - Region üzrə tamamlanma faizi statistikası
   - Region daxilində son aktivliklər
   - Region üzrə gözləyən təsdiqlər

3. RegionAdmin aşağıdakı əsas seksiyalara daxil ola bilər:
   - Sektor İdarəetməsi (yalnız öz regionunda)
   - Məktəb İdarəetməsi (yalnız öz regionunda)
   - Kateqoriya və Sütun İdarəetməsi (region səlahiyyətləri daxilində)
   - Region Hesabatları
   - Məlumat Təsdiqləmə Paneli
   - İstifadəçi İdarəetməsi
   - Sistem Konfiqurasiyası
   - Hesabat və Analitika
   - Profil və Tənzimləmələr

```
RegionAdmin Dashboard ──┬─► Sektor İdarəetməsi ──► Sektor Əlavə/Silmə/Redaktə
                        │
                        ├─► Məktəb İdarəetməsi ──► Məktəb Əlavə/Silmə/Redaktə
                        │
                        ├─► Kateqoriya İdarəetməsi ──► Kateqoriya Əlavə/Silmə/Redaktə
                        │
                        ├─► Məlumat Təsdiqləmə ──► Məlumatları Təsdiqlə/Rədd et
                        │
                        └─► Region Hesabatları ──► Hesabat Yaratma/İxrac
```

### 3.3. SectorAdmin Dashboard

1. SectorAdmin girişdən sonra Sektor Admin dashboard-a yönləndirilir
2. Dashboard-da sektor statistikaları göstərilir:
   - Sektor üzrə məktəblər sayı
   - Sektor üzrə tamamlanma faizi statistikası
   - Sektor daxilində son aktivliklər
   - Sektor üzrə gözləyən təsdiqlər

3. SectorAdmin aşağıdakı əsas seksiyalara daxil ola bilər:
   - Məktəb İdarəetməsi (yalnız öz sektorunda)
   - Məlumat Təsdiqləmə Paneli
   - Sektor Hesabatları
   - Məktəb Adminlərinə Bildirişlər Göndərmə
   - İstifadəçi İdarəetməsi
   - Sistem Konfiqurasiyası
   - Hesabat və Analitika
   - Profil və Tənzimləmələr

```
SectorAdmin Dashboard ──┬─► Məktəb İdarəetməsi ──► Məktəb məlumatlarını izləmə
                        │
                        ├─► Məlumat Təsdiqləmə ──► Məlumatları Təsdiqlə/Rədd et
                        │
                        ├─► Sektor Hesabatları ──► Hesabat Yaratma/İxrac
                        │
                        └─► Bildirişlər ──► Məktəblərə bildiriş göndərmə
```

### 3.4. SchoolAdmin Dashboard

1. SchoolAdmin girişdən sonra Məktəb Admin dashboard-a yönləndirilir
2. Dashboard-da məktəb statistikaları göstərilir:
   - Məktəb üzrə tamamlanma faizi
   - Doldurulması lazım olan kateqoriyalar
   - Son tarixlər və xəbərdarlıqlar
   - Rədd edilmiş məlumatlar və səbəbləri

3. SchoolAdmin aşağıdakı əsas seksiyalara daxil ola bilər:
   - Microsoft Forms üslubunda məlumat daxil etmə interfeysi
   - Bildirişlər Paneli
   - Excel ilə İmport Paneli
   - Məlumat Statusu İzləmə

```
SchoolAdmin Dashboard ──┬─► Məlumat Daxil Etmə ──► Forms üslubunda interfeys
                        │
                        ├─► Bildirişlər ──► Sistem bildirişlərini görmə
                        │
                        ├─► Excel İmport ──► Excel şablonu ilə məlumat idxalı
                        │
                        └─► Məlumat Statusu ──► Göndərilmiş məlumatların statusu
```

## 4. Əsas Funksionallıq Axınları

### 4.1. Region Yaratma Axını (SuperAdmin)

1. SuperAdmin dashboard-da "Regionlar" bölməsinə daxil olur
2. "Yeni Region" düyməsinə basır
3. Region məlumatlarını daxil edir:
   - Ad
   - Təsvir
   - Status (aktiv/deaktiv)
4. "Yadda saxla" düyməsinə basır
5. Sistem region yaradır və daxili bildiriş göstərir
6. Yeni yaradılmış region siyahıda görünür

### 4.2. Region Admini Təyin Etmə Axını (SuperAdmin)

1. SuperAdmin dashboard-da "Regionlar" bölməsinə daxil olur
2. Mövcud region üçün "Admin təyin et" düyməsinə basır
3. İki seçim görünür:
   - Mövcud istifadəçini təyin et
   - Yeni admin yarat
4. **Mövcud istifadəçi təyin edildikdə:**
   - Mövcud istifadəçilər siyahısından biri seçilir
   - "Təyin et" düyməsinə basılır
   - Sistem istifadəçiyə regionadmin rolu təyin edir və bildiriş göndərir
5. **Yeni admin yaradıldıqda:**
   - Admin məlumatları daxil edilir (ad, e-poçt, telefon və s.)
   - "Yarat və təyin et" düyməsinə basılır
   - Sistem yeni istifadəçi yaradır, regionadmin rolu təyin edir və giriş dəvəti göndərir

### 4.3. Kateqoriya Yaratma Axını (SuperAdmin/RegionAdmin)

1. Admin dashboard-da "Kateqoriyalar" bölməsinə daxil olur
2. "Yeni Kateqoriya" düyməsinə basır
3. Kateqoriya məlumatlarını daxil edir:
   - Ad
   - Təsvir
   - Təyinat (All/Sectors)
   - Son tarix (varsa)
   - Status (aktiv/deaktiv)
   - Prioritet
4. "Yadda saxla" düyməsinə basır
5. Sistem kateqoriya yaradır və daxili bildiriş göstərir
6. Yeni yaradılmış kateqoriya siyahıda görünür

### 4.4. Sütun Yaratma Axını (SuperAdmin/RegionAdmin)

1. Admin "Kateqoriyalar" bölməsindən bir kateqoriya seçir
2. "Sütunlar" tabına keçir
3. "Yeni Sütun" düyməsinə basır
4. Sütun məlumatlarını daxil edir:
   - Ad
   - Tip (mətn, rəqəm, tarix, seçim və s.)
   - Məcburilik statusu (required/optional)
   - Placeholder mətn
   - Köməkçi mətn
   - Sıra nömrəsi
   - Status (aktiv/deaktiv)
   - Validasiya qaydaları (min/max dəyər, format və s.)
   - Default dəyər (əgər varsa)
   - Seçim variantları (seçim tipi üçün)
5. "Yadda saxla" düyməsinə basır
6. Sistem sütun yaradır və daxili bildiriş göstərir
7. Yeni yaradılmış sütun siyahıda görünür

### 4.5. Məlumat Daxil Etmə Axını (SchoolAdmin)

1. SchoolAdmin dashboard-da kateqoriya siyahısından bir kateqoriya seçir
2. Microsoft Forms üslubunda interfeys görünür
3. Bütün tələb olunan sahələri doldurur
4. "Yadda saxla" düyməsinə basır.
5. Sistem məlumatları "Gözləmədə" statusu ilə saxlayır
6. Bildiriş göstərilir və məlumatların təsdiq gözlədiyini bildirir

### 4.6. Excel ilə Məlumat İdxalı Axını (SchoolAdmin)

1. SchoolAdmin dashboard-da "Excel ilə İdxal" bölməsinə daxil olur
2. Kateqoriya seçir
3. "Şablonu yüklə" düyməsinə basıb Excel şablonunu əldə edir
4. Şablonu oflayn doldurur
5. "Excel faylı yüklə" düyməsinə basır və doldurulmuş faylı seçir
6. Sistem məlumatları validasiya edir
7. **Validasiya uğurludursa:**
   - Məlumatlar sistemə "Gözləmədə" statusu ilə yüklənir
   - Bildiriş göstərilir və məlumatların təsdiq gözlədiyini bildirir
8. **Validasiya uğursuz olduqda:**
   - Xəta mesajları olan siyahı göstərilir
   - SchoolAdmin xətaları düzəldib yenidən yükləməlidir

### 4.7. Məlumat Təsdiqləmə Axını (SectorAdmin/RegionAdmin)

1. Admin dashboard-da "Təsdiq Gözləyən Məlumatlar" bölməsinə daxil olur
2. Təsdiq gözləyən məlumatlar siyahısı görünür
3. Admin məlumatları nəzərdən keçirir
4. Hər bir məlumat üçün təsdiq/rədd qərarı verir. Məktəbləri toplu seçib təsdiq edə bilər.  
5. **Təsdiq etdikdə:**
   - "Təsdiqlə" düyməsinə basır
   - Məlumat "Təsdiqlənmiş" statusuna keçir
6. **Rədd etdikdə:**
   - "Rədd et" düyməsinə basır
   - Rədd etmə səbəbini daxil edir
   - Məlumat "Rədd edilmiş" statusuna keçir
   - SchoolAdmin-ə bildiriş və səbəb göndərilir

### 4.8. Toplu Təsdiqləmə Axını (SectorAdmin/RegionAdmin)

1. Admin dashboard-da "Təsdiq Gözləyən Məlumatlar" bölməsinə daxil olur
2. Birdən çox məlumatı seçir
3. "Toplu Əməliyyatlar" menyusundan "Təsdiqlə" seçir
4. Təsdiq dialoqu görünür
5. Admin təsdiqi təsdiqləyir
6. Sistem bütün seçilmiş məlumatları "Təsdiqlənmiş" statusuna keçirir
7. SchoolAdmin-lərə bildirişlər göndərilir

## 5. Hesabat və Analitika Axını

### 5.1. Hesabat Yaratma Axını (Bütün Admin-lər)

1. Admin müvafiq roluna uyğun dashboard-da "Hesabatlar" bölməsinə daxil olur
2. "Yeni Hesabat" düyməsinə basır
3. Hesabat parametrlərini seçir:
   - Hesabat növü
   - Filtrlər (tarix, region, sektor, məktəb və s.)
   - Göstərilən sütunlar
   - Qruplaşdırma və sıralama
4. "Hesabatı yarat" düyməsinə basır
5. Sistem hesabatı yaradır və nəticələri göstərir
6. Admin hesabatı ixrac edə bilər:
   - Excel formatında
   - PDF formatında
   - CSV formatında

### 5.2. Dashboard Analitikası

1. Admin dashboard-da statistik widget-ləri görür
2. İnteraktiv grafiklərlə məlumatları analiz edir:
   - Tamamlanma faizi qrafikləri
   - Vaxt seriyası analizi
   - Müqayisəli analizlər
3. Parametrləri dəyişərək real vaxt rejimində analizləri yeniləyir
4. Diaqramları və analizləri ixrac edə bilir

## 6. Bildiriş Axını

### 6.1. Sistem Tərəfindən Yaradılan Bildirişlər

1. Sistem müxtəlif vəziyyətlərdə bildirişlər yaradır:
   - Yeni kateqoriya əlavə edildikdə
   - Son tarix yaxınlaşdıqda (3 gün, 1 gün qalmış)
   - Məlumatlar təsdiqlədikdə/rədd edildikdə
   - Yeni admin təyin edildikdə
2. Bildirişlər müvafiq istifadəçilərə göndərilir
3. Dashboard-da bildiriş sayı göstərilir
4. İstifadəçi bildiriş panelinə daxil olur
5. Bildirişləri oxuyur və oxunmuş kimi işarələyir

### 6.2. Admin Tərəfindən Göndərilən Bildirişlər

1. Admin "Bildirişlər" bölməsinə daxil olur
2. "Yeni Bildiriş" düyməsinə basır
3. Bildiriş parametrlərini daxil edir:
   - Alıcılar (bütün məktəblər, seçilmiş məktəblər və s.)
   - Başlıq
   - Mətn
   - Prioritet (normal, yüksək, kritik)
4. "Göndər" düyməsinə basır
5. Sistem bildirişləri müəyyən edilmiş alıcılara göndərir

## 7. Profil və Tənzimləmələr Axını

### 7.1. Profil Redaktəsi

1. İstifadəçi yuxarı sağ küncdəki profil ikonasına basır
2. Dropdown menyudan "Profil" seçir
3. Profil məlumatlarını redaktə edir:
   - Ad, soyad
   - Telefon
   - Vəzifə
   - Avatar/profil şəkli
4. "Yadda saxla" düyməsinə basır
5. Sistem məlumatları yeniləyir və təsdiq bildirişi göstərir

### 7.2. Şifrə Dəyişmə

1. İstifadəçi profil səhifəsində "Şifrəni dəyiş" tabına keçir
2. Cari şifrəni daxil edir
3. Yeni şifrəni daxil edir
4. Yeni şifrəni təkrar daxil edir
5. "Yadda saxla" düyməsinə basır
6. Sistem şifrəni yeniləyir və təsdiq bildirişi göstərir

### 7.3. Dil Tənzimləmələri

1. İstifadəçi profil səhifəsində "Tənzimləmələr" tabına keçir
2. Dil seçimləri bölməsində istədiyi dili seçir:
   - Azərbaycan
   - Rus
   - Türk
   - İngilis
3. "Yadda saxla" düyməsinə basır
4. Sistem dil parametrini yeniləyir və interfeys seçilmiş dilə keçir

### 7.4. Bildiriş Tənzimləmələri

1. İstifadəçi profil səhifəsində "Tənzimləmələr" tabına keçir
2. Bildiriş parametrləri bölməsində bildiriş növlərini aktivləşdirir/deaktivləşdirir:
   - Sistem daxili bildirişlər
   - E-mail bildirişləri
   - Son tarix xəbərdarlıqları
   - Təsdiq/rədd bildirişləri
3. "Yadda saxla" düyməsinə basır
4. Sistem bildiriş parametrlərini yeniləyir

## 8. Çıxış Axını

1. İstifadəçi yuxarı sağ küncdəki profil ikonasına basır
2. Dropdown menyudan "Çıxış" seçir
3. Supabase.auth.signOut() çağırılır
4. JWT token və local storage-dakı session məlumatları silinir
5. İstifadəçi login səhifəsinə yönləndirilir

## 9. Xəta və İstisna Axınları

### 9.1. Giriş Xətaları

1. İstifadəçi yanlış e-poçt/şifrə daxil etdikdə:
   - "Yanlış e-poçt və ya şifrə" xəta mesajı göstərilir
   - Yenidən cəhd etmək imkanı verilir

2. İstifadəçi hesabı deaktiv edildikdə:
   - "Hesabınız deaktiv edilib. Zəhmət olmasa administrator ilə əlaqə saxlayın" xəta mesajı göstərilir
   - Giriş bloklanır

### 9.2. İcazə Xətaları

1. İstifadəçi icazəsi olmayan səhifəyə/funksionallığa daxil olmağa çalışdıqda:
   - "Bu əməliyyat üçün icazəniz yoxdur" xəta mesajı göstərilir
   - İstifadəçi dashboard-a yönləndirilir

### 9.3. Məlumat Daxiletmə Xətaları

1. Məcburi sahələr doldurulmadıqda:
   - "Bu sahə məcburidir" xəta mesajı göstərilir
   - Səhv sahələr qırmızı ilə işarələnir

2. Validasiya xətaları baş verdikdə:
   - Müvafiq xəta mesajı göstərilir (məs., "Yalnız rəqəm daxil edin", "Tarix formatı düzgün deyil")
   - Səhv sahələr qırmızı ilə işarələnir

### 9.4. Şəbəkə Xətaları

1. İnternet bağlantısı olmadıqda:
   - "İnternet bağlantısı yoxdur. Zəhmət olmasa bağlantınızı yoxlayın və yenidən cəhd edin" xəta mesajı göstərilir
   - Avtomatik yenidən cəhd mexanizmi aktivləşdirilir

2. Server xətaları baş verdikdə:
   - "Server xətası baş verdi. Zəhmət olmasa sonra yenidən cəhd edin" xəta mesajı göstərilir
   - Xəta loglanır və admin bildirişi göndərilir

## 10. Mobil Uyğunluq Axını

Bütün interfeys elementləri mobil cihazlara adaptasiya olunub:

1. İstifadəçi mobil cihazda brauzeri açır
2. İnfoLine URL-inə daxil olur
3. Mobil-uyğun login interfeysi göstərilir
4. Giriş etdikdən sonra mobil-uyğun dashboard göstərilir
5. Bütün funksionallıqlar mobil ekrana uyğunlaşdırılmış şəkildə təqdim olunur:
   - Touch-optimized düymələr və form elementləri
   - Responsive cədvəllər və diaqramlar
   - Hamburger menyu və dropdown naviqasiya
   - Kiçik ekranlara uyğunlaşdırılmış məlumat daxiletmə formaları
   - Kiçik ekranlara uyğunlaşdırılmış bildirişlər
   

Bu sənəd İnfoLine proyektinin əsas istifadəçi axınlarını və əməliyyatlarını ətraflı təsvir edir. Tətbiqin funksionallığı, istifadəçi təcrübəsi və işləmə prinsipi barədə hərtərəfli məlumat təqdim edir.