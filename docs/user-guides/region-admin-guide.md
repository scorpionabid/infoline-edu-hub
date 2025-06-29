# İnfoLine - Region Admini İstifadə Təlimatı

## 📋 İçindəkilər

1. [Sistemə Daxil Olma və İlkin Quraşdırma](#sistemə-daxil-olma-və-ilkin-quraşdırma)
2. [Dashboard və Ümumi İdarəetmə](#dashboard-və-ümumi-idarəetmə)
3. [Sektor İdarəetməsi](#sektor-idarəetməsi)
4. [Məktəb İdarəetməsi](#məktəb-idarəetməsi)
5. [Kateqoriya və Sütun İdarəetməsi](#kateqoriya-və-sütun-idarəetməsi)
6. [Məlumat Təsdiqləmə və İdarəetməsi](#məlumat-təsdiqləmə-və-idarəetməsi)
7. [İstifadəçi İdarəetməsi](#istifadəçi-idarəetməsi)
8. [Hesabat və Analitika](#hesabat-və-analitika)
9. [Bildiriş Sistemi](#bildiriş-sistemi)
10. [Faydalı Məsləhətlər və Best Practices](#faydalı-məsləhətlər-və-best-practices)

---

## 🔐 Sistemə Daxil Olma və İlkin Quraşdırma

### İlk Dəfə Giriş (SuperAdmin tərəfindən təyin edildikdən sonra)

#### Addım 1: Aktivasiya
1. SuperAdmin tərəfindən göndərilən **aktivasiya e-poçtunu** açın
2. **"Hesabınızı aktivləşdirin"** linkə klikləyin
3. **Güclü şifrə** təyin edin (minimum 8 karakter, böyük/kiçik hərf, rəqəm, simvol)
4. **"Aktivləşdir"** düyməsinə basın

#### Addım 2: Profil Tamamlama
1. **Şəxsi məlumatlarınızı** tamamlayın:
   - Tam ad və soyad
   - Telefon nömrəsi
   - Vəzifə
   - İş ünvanı
2. **Profil şəkli** yükləyin (istəyə bağlı)
3. **Dil seçimi** edin (Azərbaycan, İngilis, Rus, Türk)

#### Addım 3: Region Məlumatlarının Yoxlanması
1. **Dashboard**-a keçin
2. **Region məlumatlarını** yoxlayın
3. Zəruri olduqda region məlumatlarını **redaktə edin**

---

## 🏠 Dashboard və Ümumi İdarəetmə

### Region Admin Dashboard Görünüşü

#### 📊 Əsas Göstəricilər
Dashboard-da görəcəksiniz:
- **Region Statistikaları**:
  - Ümumi sektor sayı
  - Ümumi məktəb sayı
  - Aktiv admin sayı
- **Tamamlanma Metrikaları**:
  - Region üzrə tamamlanma faizi
  - Sektor üzrə breakdown
  - Vaxtında təqdim statistikası
- **Gözləyən Tapşırıqlar**:
  - Təsdiq gözləyən məlumatlar
  - Admin təyinatı tələbləri
  - Son tarix xəbərdarlıqları

#### 📈 Real-time İzləmə
- **Canlı aktivlik axını**
- **Performans trendləri**
- **Problem sahələrinin identifikasiyası**
- **Yaxşı performans göstərən sektorlar**

---

## 🏛️ Sektor İdarəetməsi

### Sektor Yaratma və İdarəetmə

#### 🆕 Yeni Sektor Yaratma
1. **"Sektorlar"** səhifəsinə keçin
2. **"Yeni Sektor"** düyməsinə basın
3. Sektor məlumatlarını doldurun:
   - **Sektor adı** (məs: "Gəncə Şəhər Mərkəz")
   - **Əhatə sahəsi** (məs: "Şəhər mərkəzi")
   - **Məsul şəxs** (müvəqqəti)
   - **Əlaqə məlumatları**
4. **"Yadda Saxla"** düyməsinə basın

#### ✏️ Mövcud Sektor Redaktəsi
1. Sektor siyahısında **"Redaktə"** düyməsinə basın
2. Lazımi dəyişiklikləri edin
3. **"Yadda Saxla"** düyməsinə basın

#### 🗑️ Sektor Silmə
⚠️ **Diqqət**: Sektor silmək məktəbləri də təsir edir!
1. Sektor siyahısında **"Sil"** düyməsinə basın
2. Sektor adını təkrar yazın (təsdiq üçün)
3. **"Sil"** düyməsinə basın

### Sektor Admin Təyinatı

#### 👤 Sektor Admini Təyin Etmə
1. Sektor siyahısında **"Admin Təyin Et"** düyməsinə basın
2. İki seçim:

**A) Mövcud İstifadəçi Təyin Etmə:**
1. **"Mövcud İstifadəçi"** tabını seçin
2. İstifadəçi siyahısından uyğun şəxsi seçin
3. **"Təyin Et"** düyməsinə basın

**B) Yeni Admin Yaratma:**
1. **"Yeni Admin Yarat"** tabını seçin
2. Admin məlumatlarını doldurun:
   - Tam ad
   - E-poçt ünvanı
   - Telefon nömrəsi
   - İlkin şifrə
3. **"Yarat və Təyin Et"** düyməsinə basın
4. Sistem avtomatik e-poçt dəvəti göndərəcək

---

## 🏫 Məktəb İdarəetməsi

### Məktəb Əməliyyatları

#### 📋 Məktəb Siyahısı İzləmə
Regionunuzdakı bütün məktəbləri görürsünüz:
- **Məktəb adı və məkan**
- **Aid olduğu sektor**
- **Admin statusu**
- **Tamamlanma faizi**
- **Son aktivlik**

#### 🆕 Yeni Məktəb Əlavə Etmə
1. **"Məktəblər"** səhifəsinə keçin
2. **"Yeni Məktəb"** düyməsinə basın
3. Məktəb məlumatlarını doldurun:
   - **Məktəb adı**
   - **Sektor təyinatı**
   - **Direktor məlumatları**
   - **Ünvan və əlaqə**
   - **Məktəb növü** (ibtidai, orta, tam orta)
   - **Tədris dili**
4. **"Yadda Saxla"** düyməsinə basın

#### 📊 Toplu Məktəb İdxalı
**Excel vasitəsilə çoxlu məktəb əlavə etmə:**
1. **"Excel İdxal"** düyməsinə basın
2. **"Şablonu İndir"** düyməsinə basın
3. Excel şablonunu doldurun
4. **"Faylı Seç"** və doldurulmuş faylı yükləyin
5. **"İdxal Et"** düyməsinə basın

### Məktəb Admin İdarəetməsi

#### 👥 Məktəb Admini Təyin Etmə
1. Məktəb siyahısında **"Admin Təyin Et"** düyməsinə basın
2. Mövcud istifadəçi və ya yeni admin yaradın
3. Məktəb-istifadəçi əlaqəsini təsdiqləyin

#### 🔄 Admin Dəyişdirilməsi
1. **"Admin Dəyişdir"** düyməsinə basın
2. Yeni admin seçin və ya yaradın
3. Köhnə adminə bildiriş göndərilir

---

## 📂 Kateqoriya və Sütun İdarəetməsi

### Kateqoriya İdarəetməsi

#### 🆕 Yeni Kateqoriya Yaratma
1. **"Kateqoriyalar"** səhifəsinə keçin
2. **"Yeni Kateqoriya"** düyməsinə basın
3. Kateqoriya parametrləri:
   - **Ad və təsvir**
   - **Təyinat**:
     - `All` - Bütün istifadəçilər görür
     - `Sectors` - Yalnız sektor adminləri görür
   - **Son tarix** (istəyə bağlı)
   - **Prioritet səviyyəsi**
4. **"Yadda Saxla"** düyməsinə basın

#### ✏️ Kateqoriya Redaktəsi
1. Kateqoriya siyahısında **"Redaktə"** düyməsinə basın
2. Zəruri dəyişiklikləri edin
3. ⚠️ **Qeyd**: Aktiv məlumatları olan kateqoriyalar məhdud redaktə edilə bilər

### Sütun İdarəetməsi

#### 📋 Kateqoriyaya Sütun Əlavə Etmə
1. Kateqoriya seçin və **"Sütunlar"** tabına keçin
2. **"Yeni Sütun"** düyməsinə basın
3. Sütun məlumatlarını konfiqurasiya edin:

**Əsas Məlumatlar:**
- **Sütun adı**
- **Tip seçimi**:
  - 📝 Mətn (text)
  - 🔢 Rəqəm (number)
  - 📅 Tarix (date)
  - ☑️ Checkbox
  - 🔘 Radio button
  - 📋 Dropdown/Select
  - 📎 Fayl (file)

**Validasiya Qaydaları:**
- **Məcburi/İstəyə bağlı**
- **Minimum/maksimum dəyər** (rəqəm sahələri üçün)
- **Format pattern** (mətn sahələri üçün)
- **Seçim variantları** (dropdown üçün)

**Kömək Mətnləri:**
- **Placeholder mətn**
- **Kömək mətni** (sahənin altında göstərilər)
- **Nümunə dəyər**

#### 🔧 Sütun Validasiya Qaydaları

**Mətn Sahələri üçün:**
```
Minimum uzunluq: 3
Maksimum uzunluq: 500
Pattern: Yalnız hərf və rəqəm
```

**Rəqəm Sahələri üçün:**
```
Minimum dəyər: 0
Maksimum dəyər: 10000
Onluq həssaslıq: 2
```

**Tarix Sahələri üçün:**
```
Minimum tarix: 2020-01-01
Maksimum tarix: Cari tarix + 1 il
Format: dd/mm/yyyy
```

---

## ✅ Məlumat Təsdiqləmə və İdarəetməsi

### Unified Data Management Panel

#### 🎯 Ana İş Axını
1. **"Məlumat İdarəetməsi"** səhifəsinə keçin
2. **Kateqoriya seçin** (dropdown-dan)
3. **Sütun seçin** (kateqoriyaya uyğun sütunlar)
4. **Data Grid** avtomatik yüklənəcək

#### 📊 Region Səviyyəsində Data Grid
Grid-də görəcəksiniz:
- **Məktəb adları** (sol sütunda)
- **Sektor təsnifatı** (rəng kodları ilə)
- **Hər məktəbın məlumatı**
- **Status indikatorları**:
  - 📝 **Qaralama** - Hələ təqdim edilməyib
  - ⏳ **Sektor təsdiq gözləyir** - Sektor adminində
  - 🔄 **Region təsdiq gözləyir** - Sizin təsdiqdə
  - ✅ **Təsdiqləndi** - Siz təsdiqləmisiniz
  - ❌ **Rədd edildi** - Siz və ya sektor admin rədd edib

### Təsdiqləmə Proseduru

#### ✅ Region Səviyyəsində Təsdiqləmə
1. **Data Grid**-də məlumatları nəzərdən keçirin
2. Sektor admin tərəfindən təsdiqlənmiş məlumatları yoxlayın
3. **Keyfiyyət nəzarəti** edin:
   - Məlumatın məntiqiliyi
   - Digər sektorlarla müqayisə
   - Trend analizini nəzərə alın

#### ❌ Rədd Etmə (Escalation)
Məlumatı rədd etdikdə:
1. **Rədd səbəbini ətraflı yazın**
2. **Düzəliş təklifi** verin
3. **Sektor admin və məktəb adminə** bildiriş göndərilir

#### 🔄 Delegasiya
Region Admin kimi sektor adminlərə səlahiyyət verə bilərsiniz:
1. **"Delegasiya Ayarları"** bölməsinə keçin
2. Sektor adminə **təsdiq səlahiyyəti** verin
3. **Monitoring hüququnu** saxlayın

---

## 👥 İstifadəçi İdarəetməsi

### Region Daxilində İstifadəçi İdarəetməsi

#### 📋 İstifadəçi Siyahısı
Region daxilindəki bütün istifadəçiləri görürsünüz:
- **Sektor adminləri**
- **Məktəb adminləri**
- **Aktiv/deaktiv statuslar**
- **Son aktivlik tarixi**

#### 👤 Yeni İstifadəçi Yaratma
1. **"İstifadəçilər"** səhifəsinə keçin
2. **"Yeni İstifadəçi"** düyməsinə basın
3. İstifadəçi məlumatları:
   - **Şəxsi məlumatlar**
   - **Rol təyinatı**
   - **Sektor/Məktəb bağlantısı**
   - **İlkin şifrə**
4. **"Yarat və Dəvət Göndər"** düyməsinə basın

#### 🔄 Rol Dəyişdirilməsi
1. İstifadəçi siyahısında **"Rol Dəyişdir"** seçin
2. Yeni rol təyin edin
3. Yeni təyinat edin (sektor/məktəb)
4. **"Təsdiq"** düyməsinə basın

#### 🚫 İstifadəçi Deaktivləşdirmə
1. **"Deaktiv Et"** düyməsinə basın
2. Deaktivləşdirmə səbəbi seçin
3. **"Təsdiq"** düyməsinə basın
4. İstifadəçiyə bildiriş göndərilir

### Toplu İstifadəçi Əməliyyatları

#### 📊 Excel ilə Toplu İdxal
1. **"Toplu İdxal"** düyməsinə basın
2. **"İstifadəçi Şablonu İndir"** düyməsinə basın
3. Excel şablonunu doldurun:
   - Ad, soyad, e-poçt
   - Rol təyinatı
   - Sektor/məktəb bağlantısı
4. **"İdxal Et"** düyməsinə basın

---

## 📈 Hesabat və Analitika

### Region Hesabatları

#### 📊 Dashboard Analitikası
- **Real-time statistikalar**
- **Trend analizləri**
- **Performans müqayisələri**
- **Problem sahələrinin identifikasiyası**

#### 📋 Hesabat Növləri

**1. Region Ümumi Hesabatı:**
- Bütün sektorlar üzrə məlumatlar
- Tamamlanma faizləri
- Vaxtında/gecikmiş təqdimatlar

**2. Sektor Müqayisə Hesabatı:**
- Sektorlar arası performans müqayisəsi
- Ən yaxşı/ən pis performans
- Təkmilləşdirmə sahələri

**3. Trend Analizi Hesabatı:**
- Vaxt üzrə progress analizi
- Mövsümsal trendlər
- Proqnozlar

**4. Keyfiyyət Hesabatı:**
- Məlumat keyfiyyəti analizi
- Rədd edilmə statistikası
- Validasiya problemləri

### Excel Export Konfiqurasiyası

#### 📊 Hesabat Yaratma
1. **"Hesabatlar"** səhifəsinə keçin
2. **"Yeni Hesabat"** düyməsinə basın
3. Parametrləri konfiqurasiya edin:
   - **Hesabat növü**
   - **Tarix aralığı**
   - **Sektorlar** (hamısı və ya seçilmişlər)
   - **Kateqoriyalar**
   - **Məlumat detalları**
4. **"Hesabat Yarat"** düyməsinə basın

#### 📈 Avtomatik Hesabatlar
**Həftəlik Avtomatik Hesabatlar:**
- Hər bazar ertəsi həftəlik progress
- Performans analizi
- Problem sahələri

**Aylıq Hesabatlar:**
- Aylıq tamamlanma hesabatı
- Trend analizi
- Regional müqayisə

---

## 📢 Bildiriş Sistemi

### Region Bildiriş İdarəetməsi

#### 📝 Bildiriş Yaratma və Göndərmə
1. **"Bildirişlər"** səhifəsinə keçin
2. **"Yeni Bildiriş"** düyməsinə basın
3. Bildiriş konfiqurasiyası:
   - **Başlıq və mətn**
   - **Prioritet səviyyəsi**
   - **Alıcı qrupları**:
     - Bütün region
     - Seçilmiş sektorlar
     - Seçilmiş məktəblər
     - Konkret istifadəçilər
4. **"Göndər"** düyməsinə basın

#### 🔔 Avtomatik Bildiriş Konfiqurasiyası
**Son Tarix Xəbərdarlıqları:**
- 7 gün qalmış - İlk xəbərdarlıq
- 3 gün qalmış - İkinci xəbərdarlıq
- 1 gün qalmış - Təcili xəbərdarlıq
- Son tarix keçdikdə - Son bildiriş

**Performans Bildirişləri:**
- Həftəlik progress yeniləmələri
- Aylıq performans hesabatları
- Problem sahələri haqqında xəbərdarlıqlar

### E-poçt Template İdarəetməsi

#### 📧 E-poçt Şablonları
1. **"E-poçt Şablonları"** bölməsinə keçin
2. Mövcud şablonları görün və redaktə edin:
   - **Xoş gəldin mesajı** (yeni istifadəçilər üçün)
   - **Son tarix xəbərdarlığı**
   - **Təsdiq bildirişi**
   - **Rədd bildirişi**
3. **"Redaktə"** düyməsinə basın
4. Şablon mətnini dəyişdirin
5. **"Yadda Saxla"** düyməsinə basın

---

## 💡 Faydalı Məsləhətlər və Best Practices

### 🎯 Səmərəli Region İdarəetməsi

#### 1. Planlaşdırma və Təşkil
**Həftəlik Rutina:**
- **Bazar ertəsi**: Həftəlik plan və prioritetlər
- **Çərşənbə**: Orta həftə progress review
- **Cümə**: Həftəlik nəticələr və növbəti həftə hazırlığı

**Aylıq Strategiya:**
- Aylıq hədəflərin müəyyənləşdirilməsi
- Performans göstəricilərinin izlənməsi
- Problemli sahələrə fokus

#### 2. Sektor Adminləri ilə Əlaqə
**Gündəlik Kommunikasiya:**
- Səhər brief-ləri (Slack/Teams)
- Gün ərzində dəstək
- Axşam nəticələrin ümumiləşdirilməsi

**Həftəlik Görüşlər:**
- Video call sektor adminləri ilə
- Problemlərin müzakirəsi
- Növbəti həftə planlaşdırması

#### 3. Keyfiyyət Nəzarəti
**Məlumat Keyfiyyəti:**
- Statistik anomaliyaların izlənməsi
- Cross-validation müxtəlif mənbələrlə
- Trend analizinin aparılması

**Proses Keyfiyyəti:**
- SLA (Service Level Agreement) izlənməsi
- Cavab verme vaxtlarının ölçülməsi
- İstifadəçi məmnuniyyətinin qiymətləndirilməsi

### 🚨 Problem Həll Strategiyaları

#### 1. Texniki Problemlər
**Sistem Performans Problemləri:**
- Performance Dashboard izləmə
- Yüksek load zamanlarının müəyyənləşdirilməsi
- Texniki komanda ilə koordinasiya

**İstifadəçi Problemləri:**
- Helpdesk ticket sisteminin idarəetməsi
- Tez-tez soruşulan sualların sənədləşdirilməsi
- Video tutorial hazırlanması

#### 2. Proses Problemləri
**Gecikmələrin İdarəetməsi:**
- Gecikməyən məktəblərin identifikasiyası
- Kömək resurslarının mobilizasiyası
- Escalation prosedurlarının tətbiqi

**Keyfiyyət Problemləri:**
- Səhv məlumatların analizi
- Təlim ehtiyaclarının müəyyənləşdirilməsi
- Proses təkmilləşdirmələrinin həyata keçirilməsi

#### 3. İnsan Resursları Problemləri
**Sektor Admin Problemləri:**
- Performans monitoring
- Əlavə təlim və dəstək
- Zəruri hallarda əvəzetmə

**Məktəb Admin Problemləri:**
- Sektor adminləri vasitəsilə dəstək
- Regional səviyyədə müdaxilə
- İdarəetmə həll yolları

### 📞 Eskalasiya Proseduru

#### 1. Daxili Eskalasiya (Region Daxilində)
1. **Birinci səviyyə**: Sektor admin həll cəhdi
2. **İkinci səviyyə**: Region admin müdaxiləsi
3. **Üçüncü səviyyə**: Regional komanda dəstəyi

#### 2. Kənari Eskalasiya (SuperAdmin-ə)
1. **Texniki problemlər**: Sistem xətaları
2. **Siyasət problemləri**: Proses dəyişiklikləri
3. **Strateji qərarlar**: Böyük miqyaslı dəyişikliklər

#### 3. Təcili Hallar Protokolu
1. **Təcili bildiriş** SuperAdmin-ə
2. **Müvəqqəti həll** tətbiqi
3. **Post-incident analiz** və sənədləşdirmə

---

## 📋 Qısa Xülasə (Quick Reference)

### Gündəlik Əməliyyatlar Checklist:

#### 🌅 Səhər (09:00-10:00):
- [ ] Dashboard statistikalarını yoxla
- [ ] Gecə bildirişlərini oxu
- [ ] Təcili problemləri identifikasiya et
- [ ] Gün planını hazırla

#### 🌞 Günorta (12:00-14:00):
- [ ] Sektor adminləri ilə check-in
- [ ] Təsdiq gözləyən məlumatları yoxla
- [ ] Performance metrikalarını analiz et

#### 🌆 Axşam (17:00-18:00):
- [ ] Gün nəticələrini ümumiləşdir
- [ ] Sabah üçün prioritetləri müəyyənləşdir
- [ ] SuperAdmin-ə günlük hesabat

### Həftəlik Əməliyyatlar:
- [ ] Həftəlik performans hesabatı
- [ ] Sektor adminləri ilə review görüşü
- [ ] Problemli sahələrin analizi
- [ ] Növbəti həftə planlaşdırması

### Aylıq Əməliyyatlar:
- [ ] Aylıq comprehensive hesabat
- [ ] Regional trend analizi
- [ ] Proses təkmilləşdirmə təklifləri
- [ ] Yeni hədəflərin müəyyənləşdirilməsi

---

## 📞 Əlaqə və Dəstək

### SuperAdmin Əlaqə
- **E-poçt**: [superadmin@infoline.az]
- **WhatsApp**: [Nömrə]
- **Təcili hallar**: [Təcili nömrə]

### Texniki Dəstək
- **Helpdesk**: [support@infoline.az]
- **Telefon**: [Dəstək nömrəsi]
- **İş saatları**: B.e - Cümə, 09:00-18:00

### Sistem Administratoru
- **E-poçt**: [sysadmin@infoline.az]
- **Təcili hallar**: [Sys Admin nömrəsi]

---

**📚 Bu təlimat mütəmadi yenilənir. Son versiya həmişə sistem daxilində əlçatandır.**
**🔄 Son yenilənmə: [Tarix]**