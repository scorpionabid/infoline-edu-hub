# İnfoLine İstifadəçi Təlimatları

Bu qovluqda İnfoLine sisteminin bütün istifadəçi rolları üçün ətraflı istifadə təlimatları yerləşir.

## 📋 Mövcud Təlimatlar

### 🏫 [Məktəb Admini Təlimatı](./school-admin-guide.md)
**Kim üçün**: Məktəb səviyyəsində məlumat daxil edən adminlər

**Əhatə edir**:
- Sistemə giriş və ilk quraşdırma
- Dashboard istifadəsi
- Məlumat daxil etmə prosesi (Microsoft Forms üslubunda)
- Kateqoriya və sütun seçimi
- Excel import/export əməliyyatları
- Status izləmə və təsdiq prosesi
- Faydalı məsləhətlər və xəta həlləri

### 🏛️ [Sektor Admini Təlimatı](./sector-admin-guide.md)  
**Kim üçün**: Sektor səviyyəsində məktəbləri idarə edən və məlumatları təsdiqləyən adminlər

**Əhatə edir**:
- Sektor admin dashboard idarəetməsi
- Məktəb əlavə etmə və admin təyinatı
- Məlumat təsdiqləmə prosesi (kateqoriya → sütun → grid)
- Bildiriş göndərmə (tək və toplu)
- Hesabat və analitika
- Sektor data entry
- Performance izləmə və problem həlli

### 🌍 [Region Admini Təlimatı](./region-admin-guide.md)
**Kim üçün**: Region səviyyəsində tam idarəetmə səlahiyyəti olan adminlər

**Əhatə edir**:
- Region struktur idarəetməsi
- Sektor yaratma və admin təyinatı
- Məktəb idarəetməsi və toplu əməliyyatlar
- Kateqoriya və sütun master idarəetməsi
- Məlumat təsdiqləmə və keyfiyyət nəzarəti
- İstifadəçi idarəetməsi və rol təyinatları
- Hesabat və analitika dashboard
- Bildiriş sistemi idarəetməsi

### ⚡ [SuperAdmin Təlimatı](./superadmin-guide.md)
**Kim üçün**: Sistem administratorları və texniki liderlik

**Əhatə edir**:
- Sistem arxitekturası və quraşdırma
- Global region idarəetməsi
- Master kateqoriya və sütun sistemi
- İstifadəçi və rol idarəetməsi (RBAC)
- Sistem konfiqurasiyası və inteqrasiyalar
- Monitorinq və performance analizi
- Backup və disaster recovery
- Fövqəladə hallar və troubleshooting

---

## 🎯 Rol Əsasında Tez Giriş

### 🔰 Yeni İstifadəçilər üçün
İlk dəfə sistemə daxil olursunuzsa:

1. **E-poçtunuzu yoxlayın** - Admin tərəfindən göndərilən dəvət linki
2. **Profil tamamlayın** - Şəxsi məlumatlarınızı əlavə edin  
3. **Öz rolunuzun təlimatını oxuyun** - Yuxarıdakı siyahıdan seçin
4. **Dashboard-ı araşdırın** - Əsas funksiyalarla tanış olun

### 📚 Sürətli Axtarış

| Rol | Əsas Funksiyanı | Başlama Nöqtəsi |
|-----|----------------|------------------|
| **Məktəb Admin** | Məlumat daxil etmək | Dashboard → "Məlumat Daxil Et" |
| **Sektor Admin** | Məlumatları təsdiqləmək | Sol menyu → "Məlumat İdarəetməsi" |
| **Region Admin** | Sektorları idarə etmək | Dashboard → "Sektorlar" |
| **SuperAdmin** | Sistemi idarə etmək | Dashboard → "Sistem İdarəetməsi" |

---

## 🔄 Sistem Axını - Qısa Xülasə

```
1. SuperAdmin → Regionlar yaradır
2. SuperAdmin/RegionAdmin → Region admini təyin edir
3. RegionAdmin → Sektorlar yaradır və sektor adminləri təyin edir
4. RegionAdmin/SectorAdmin → Məktəblər əlavə edir və məktəb adminləri təyin edir
5. RegionAdmin → Kateqoriyalar və sütunlar yaradır
6. MəktəbAdmin → Məlumatları daxil edir
7. SektorAdmin → Məlumatları təsdiqləyir
8. RegionAdmin → Final təsdiq və hesabatlar
```

---

## 📞 Kömək və Dəstək

### 🆘 Təcili Yardım
- **Texniki Problemlər**: Səhifəni yeniləyin, başqa brauzer cəhd edin
- **Giriş Problemləri**: "Şifrəni unutdum" funksiyasından istifadə edin
- **Məlumat İtməsi**: Avtomatik yadda saxlama yoxlayın

### 📧 Əlaqə
- **Texniki Dəstək**: support@infoline.az
- **Sistem Administratoru**: admin@infoline.az
- **Təlim və Kömək**: training@infoline.az

### 📱 Mobil Dəstək
Bütün funksiyalar mobil cihazlarda da işləyir:
- **Android**: Chrome brauzer tövsiyə olunur
- **iOS**: Safari və ya Chrome istifadə edin
- **Tablet**: Tam masaüstü təcrübəsi

---

## 🚀 Yeni Xüsusiyyətlər

### v2.1.0 Yenilikləri
- ✨ Microsoft Forms üslubunda təkmilləşdirilmiş forma dizaynı
- 📊 Real-time dashboard statistikaları
- 🔄 Avtomatik yadda saxlama və sync
- 📱 Təkmilləşdirilmiş mobil təcrübə
- 🌐 4 dil dəstəyi (Az, En, Ru, Tr)

### Gələcək Planlar (v2.2.0)
- 🤖 AI-powered məlumat validasiya
- 📈 Predictive analytics
- 🔗 API inteqrasiyaları
- 📋 Custom report builder

---

## 📝 Təlimat Haqqında

### 📅 Yenilənmə Tarixçəsi
- **v1.0** (2025-01-01): İlkin təlimatlar
- **v1.1** (2025-01-15): Sektor admin funksiyaları əlavə edildi
- **v1.2** (2025-02-01): Excel import/export detalları
- **v1.3** (Cari): Bütün rollar üçün tam təlimatlar

### ✍️ Müəlliflər
- Sistem Analitik Komandası
- UX/UI Design Team
- Technical Documentation Team
- Beta Test İstifadəçiləri

### 📖 Tövsiyələr
1. **Öz rolunuzun təlimatını əvvəlcə oxuyun**
2. **Praktika edin** - test məlumatları ilə
3. **Qeydlər aparın** - özünüzə məxsus qısayollar
4. **Suallarınızı soruşun** - dəstək komandası həmişə hazırdır

---

**💡 Məsləhət**: Hər təlimatın sonunda "Qısa Xülasə" bölməsi var - oranı bookmark-layın və tez-tez baxın!

**🔄 Son yenilənmə**: 2025-01-XX  
**📧 Geri bildirim**: documentation@infoline.az