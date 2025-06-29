# İnfoLine - SuperAdmin İstifadə Təlimatı

## 📋 İçindəkilər

1. [Sistem Arxitekturası və İlkin Quraşdırma](#sistem-arxitekturası-və-ilkin-quraşdırma)
2. [SuperAdmin Dashboard və Monitorinq](#superadmin-dashboard-və-monitorinq)
3. [Region İdarəetməsi](#region-idarəetməsi)
4. [Global Kateqoriya və Sütun İdarəetməsi](#global-kateqoriya-və-sütun-idarəetməsi)
5. [İstifadəçi və Rol İdarəetməsi](#istifadəçi-və-rol-idarəetməsi)
6. [Sistem Konfiqurasiyası](#sistem-konfiqurasiyası)
7. [Monitorinq və Performance](#monitorinq-və-performance)
8. [Backup və Recovery](#backup-və-recovery)
9. [Hesabat və Analytics](#hesabat-və-analytics)
10. [Fövqəladə Hallar və Troubleshooting](#fövqəladə-hallar-və-troubleshooting)

---

## 🏗️ Sistem Arxitekturası və İlkin Quraşdırma

### Sistem Arxitekturasının Başlanması

#### 🔐 İlk SuperAdmin Yaradılması
SuperAdmin hesabının yaradılması Supabase Edge Function vasitəsilə:

1. **Database direkten yaratmaq (İlk quraşdırma üçün):**
```sql
-- Supabase SQL Editor-də icra edin
INSERT INTO profiles (id, full_name, email, status)
VALUES (
  auth.uid(), 
  'System Administrator', 
  'admin@infoline.az', 
  'active'
);

INSERT INTO user_roles (user_id, role)
VALUES (auth.uid(), 'superadmin');
```

2. **Edge Function vasitəsilə yaratmaq:**
- `/create-superadmin` endpoint-inə POST sorğu
- E-poçt və şifrə göndərin
- Sistem avtomatik SuperAdmin yaradacaq

#### 🏛️ İlk Region Yaratmaq
1. Login etdikdən sonra **"Regionlar"** səhifəsinə keçin
2. **"İlk Region Yarat"** düyməsinə basın
3. Region məlumatlarını doldurun:
   - **Region adı** (məs: "Gəncə Region")
   - **Mərkəz şəhər**
   - **Coğrafi əhatə**
   - **Məsul şəxs məlumatları**

---

## 🏠 SuperAdmin Dashboard və Monitorinq

### SuperAdmin Dashboard Görünüşü

#### 📊 Sistem Statistikaları
Dashboard-da bütün sistemin ümumi görünüşü:

**Ümumi Göstəricilər:**
- 🏛️ **Ümumi Region Sayı**: XX region
- 🏢 **Ümumi Sektor Sayı**: XXX sektor  
- 🏫 **Ümumi Məktəb Sayı**: XXXX məktəb
- 👥 **Aktiv İstifadəçi Sayı**: XXXXX istifadəçi

**Performance Metrikaları:**
- 📈 **Sistem Tamamlanma Faizi**: XX%
- ⏱️ **Ortalama Cavab Müddəti**: X saniyə
- 🔄 **API Call Sayı (24 saat)**: XXXXX
- 💾 **Verilənlər Bazası Ölçüsü**: XX GB

**Real-time İzləmə:**
- 🟢 **Onlayn İstifadəçilər**: XX nəfər
- 📊 **Sistem Yükü**: XX% CPU, XX% Memory
- 🌐 **Şəbəkə Statusu**: Stabil/Problemli
- 💿 **Storage İstifadəsi**: XX GB / XXX GB

#### 🚨 Xəbərdarlıq Sistemi
**Kritik Xəbərdarlıqlar:**
- 🔴 **Sistem Down**: Kritik komponentlər işləmir
- 🟡 **Yüksək Yük**: Sistem yükü 80%-dən çox
- 🟠 **Gecikmiş Təqdimatlar**: Son tarix keçmiş məlumatlar
- ⚫ **Storage Dolur**: Disk sahəsi 90%-dən çox

---

## 🏛️ Region İdarəetməsi

### Global Region İdarəetməsi

#### 🆕 Yeni Region Yaratmaq
1. **"Regionlar"** səhifəsinə keçin
2. **"Yeni Region"** düyməsinə basın
3. Region konfiqurasiyası:
   - **Əsas Məlumatlar:**
     - Region adı
     - Coğrafi kod (QR code üçün)
     - Mərkəz şəhər
     - İdarəetmə mərkəzi ünvanı
   - **Administrativ Məlumatlar:**
     - Region admin (təyin edilməmiş/təyin edilmiş)
     - Əlaqə məlumatları
     - Status (aktiv/deaktiv)
   - **Texniki Parametrlər:**
     - Region timezone
     - Dil prioriteti
     - Xüsusi konfiqurasiyalar

#### 👤 Region Admini Təyin Etmək
**Yeni Region Admin Yaratmaq:**
1. Region siyahısında **"Admin Təyin Et"** düyməsinə basın
2. **"Yeni Admin Yarat"** seçimini edin
3. Admin məlumatları:
   - **Şəxsi məlumatlar** (Ad, soyad, telefon)
   - **E-poçt ünvanı** (unikal olmalıdır)
   - **İlkin şifrə** (güclü şifrə)
   - **Səlahiyyətlər**:
     - Tam region səlahiyyəti
     - Sektor yaratma icazəsi
     - Məktəb təyin etmə icazəsi
     - Kateqoriya idarəetmə icazəsi

**Mövcud İstifadəçini Təyin Etmək:**
1. **"Mövcud İstifadəçi Təyin Et"** seçimini edin
2. İstifadəçi axtarışı və seçimi
3. Region təyinatının təsdiqi

#### 🔄 Region Məlumatlarının Yenilənməsi
1. Region siyahısında **"Redaktə"** düyməsinə basın
2. Lazımi sahələri dəyişdirin
3. **"Yadda Saxla"** düyməsinə basın
4. Sistem avtomatik audit log yaradacaq

#### 🗑️ Region Silmə (Fövqəladə Hal)
⚠️ **ÇOX TƏHLÜKƏLİ**: Region silmək bütün alt-strukturları silir!

1. **"Advanced Operations"** bölməsinə keçin
2. **"Region Sil"** düyməsinə basın
3. **Təsdiq proseduru:**
   - Region adını tam yazın
   - Admin şifrəsini daxil edin
   - **"PERMANENT DELETE"** yazın
4. **"Son Silmə"** düyməsinə basın

---

## 📂 Global Kateqoriya və Sütun İdarəetməsi

### Master Kateqoriya İdarəetməsi

#### 🌐 Global Kateqoriya Yaratmaq
1. **"Master Kateqoriyalar"** səhifəsinə keçin
2. **"Yeni Global Kateqoriya"** düyməsinə basın
3. Kateqoriya konfiqurasiyası:
   - **Əsas Parametrlər:**
     - Kateqoriya adı (çoxdilli dəstək)
     - Təsvir və açıqlama
     - Kateqoriya ikonu
   - **Təyinat Parametrləri:**
     - `Global-All`: Bütün regionlar, bütün istifadəçilər
     - `Global-Sectors`: Bütün regionlar, yalnız sektor adminləri
     - `Regional`: Region adminləri öz regionları üçün adaptasiya edə bilər
   - **Vaxt Parametrləri:**
     - Global son tarix
     - Təxirə salınabilir/salınabilməz
     - Prioritet səviyyəsi (1-5)

#### 🔧 Template Sütun Sistemi
**Master Template Yaratmaq:**
1. Kateqoriyaya **"Template Sütunlar"** əlavə edin
2. Hər sütun üçün konfiqurasiya:
   - **Sütun Tipi:**
     - Mətn (validasiya ilə)
     - Rəqəm (range və format)
     - Tarix (format və məhdudiyyətlər)
     - Seçim (options dinamik ola bilər)
     - Fayl (format və ölçü məhdudiyyətləri)
   - **Məcburiyyət Parametrləri:**
     - Global məcburi
     - Regional məcburi
     - İstəyə bağlı
   - **Validasiya Qaydaları:**
     - Mətn pattern (regex)
     - Rəqəm aralığı
     - Fayl formatları

**Regional Override İmkanı:**
Region adminləri master template-də:
- Kömək mətnlərini dəyişə bilər
- Seçim variantlarını əlavə edə bilər (silə bilməz)
- İstəyə bağlı sahələri məcburi edə bilər (əksinə deyil)

### Global Konfiqurasiya

#### 🌍 Çoxdilli Dəstək
1. **"Lokalizasiya"** bölməsinə keçin
2. **"Yeni Tərcümə"** əlavə edin:
   - Azərbaycan (əsas dil)
   - İngilis 
   - Rus
   - Türk
3. Hər dil üçün:
   - Kateqoriya adları
   - Sütun adları
   - Validasiya mesajları
   - Sistem mesajları

---

## 👥 İstifadəçi və Rol İdarəetməsi

### Global İstifadəçi İdarəetməsi

#### 📊 İstifadəçi Statistikaları
**Real-time İstifadəçi Metrikaları:**
- 👤 **Ümumi İstifadəçi Sayı**: XXXXX
- 🟢 **Aktiv İstifadəçilər**: XXXX (son 30 gün)
- 🔴 **Deaktiv İstifadəçilər**: XXX
- 📈 **Yeni Qeydiyyatlar**: XX (bu həftə)

**Rol üzrə Breakdown:**
- 🔵 **SuperAdmin**: X nəfər
- 🟢 **RegionAdmin**: XX nəfər  
- 🟡 **SectorAdmin**: XXX nəfər
- 🟠 **SchoolAdmin**: XXXX nəfər

#### 🔍 İstifadəçi Axtarış və Filtrlər
**Güclü Axtarış Sistemi:**
1. **"Bütün İstifadəçilər"** səhifəsinə keçin
2. **Filtrlər:**
   - Region üzrə
   - Rol üzrə
   - Status üzrə (aktiv/deaktiv/bloklanmış)
   - Son aktivlik tarixi
   - Qeydiyyat tarixi
3. **Axtarış:**
   - Ad/soyada görə
   - E-poçta görə
   - Telefon nömrəsinə görə

#### 👤 İstifadəçi Yaratma və Redaktə
**Toplu İstifadəçi Yaratmaq:**
1. **"Toplu İdxal"** düyməsinə basın
2. **"Master Template İndir"** düyməsinə basın
3. Excel template-ni doldurun:
   - Şəxsi məlumatlar
   - Rol təyinatı
   - Region/Sektor/Məktəb bağlantısı
   - İlkin şifrə
4. **"Toplu İdxal"** düyməsinə basın

**Tək İstifadəçi Yaratmaq:**
1. **"Yeni İstifadəçi"** düyməsinə basın
2. **Addım-addım Wizard:**
   - **1-ci addım**: Şəxsi məlumatlar
   - **2-ci addım**: Rol seçimi
   - **3-cü addım**: Təyinatlar
   - **4-cü addım**: İcazələr və məhdudiyyətlər

### Təhlükəsizlik və İcazələr

#### 🔐 Rol-əsaslı İcazələr (RBAC)
**SuperAdmin İcazələri:**
- ✅ Bütün əməliyyatlara tam giriş
- ✅ İstifadəçi yaratma/silmə
- ✅ Sistem konfiqurasiyası
- ✅ Backup və restore
- ✅ Performance monitoring

**Regional İcazə Delegation:**
1. **"İcazə İdarəetməsi"** bölməsinə keçin
2. Region admin üçün xüsusi icazələr:
   - Kateqoriya yaratma səviyyəsi
   - İstifadəçi idarəetmə səviyyəsi
   - Hesabat əlçatanlığı
   - Sistem monitoring icazəsi

#### 🛡️ Təhlükəsizlik Siyasətləri
**Şifrə Siyasəti:**
- Minimum 8 karakter
- Böyük və kiçik hərf
- Ən azı 1 rəqəm və simvol
- Şifrə tarixçəsi (son 5 şifrə)
- Şifrə dəyişmə məcburiyyəti (90 gün)

**Session İdarəetməsi:**
- Session timeout: 8 saat
- Concurrent session limit: 3
- İnaktivlik timeout: 30 dəqiqə
- Force logout: admin tərəfindən

---

## ⚙️ Sistem Konfiqurasiyası

### Əsas Sistem Parametrləri

#### 🔧 Global Sistem Ayarları
1. **"Sistem Konfiqurasiyası"** səhifəsinə keçin
2. **Əsas Parametrlər:**
   - **Sistemin adı**: İnfoLine Education Hub
   - **Versiya**: v2.1.0
   - **İş rejimi**: Production/Development/Testing
   - **Debug səviyyəsi**: Error/Warning/Info/Debug

**Performance Ayarları:**
- **API Rate Limiting**: 1000 req/hour per user
- **File Upload Limit**: 50MB per file
- **Session Timeout**: 8 hours
- **Cache TTL**: 15 minutes

**E-poçt Konfiqurasiyası:**
- SMTP Server konfiqurasiyası
- Template engine ayarları
- Bulk email limits
- Bounce handling

#### 📊 Verilənlər Bazası Ayarları
**Connection Pool:**
- Max connections: 100
- Idle timeout: 300 seconds
- Connection lifetime: 3600 seconds

**Backup Parametrləri:**
- Avtomatik backup: Gündəlik 02:00
- Retention period: 30 gün
- Compression: GZIP
- Encryption: AES-256

### Xarici İnteqrasiyalar

#### 📧 E-poçt Servisi
**SMTP Konfiqurasiyası:**
1. **"İnteqrasiyalar"** bölməsinə keçin
2. **"E-poçt Ayarları"** düyməsinə basın
3. SMTP parametrləri:
   - Server: smtp.gmail.com
   - Port: 587 (TLS) və ya 465 (SSL)
   - Authentication: Username/Password
   - From address: noreply@infoline.az

#### 📱 SMS Servisi (İstəyə bağlı)
**SMS Gateway:**
- Provider seçimi
- API credentials
- Message templates
- Rate limiting

---

## 📈 Monitorinq və Performance

### Sistem Performance İzləmə

#### 📊 Real-time Monitoring Dashboard
**Sistem Metrikaları:**
- 💻 **CPU İstifadəsi**: XX% (threshold: 80%)
- 🧠 **Memory İstifadəsi**: XX% (threshold: 85%)
- 💾 **Disk İstifadəsi**: XX% (threshold: 90%)
- 🌐 **Network I/O**: XX Mbps

**Verilənlər Bazası Metrikaları:**
- 📊 **Active Connections**: XX/100
- ⏱️ **Query Response Time**: XX ms
- 📈 **Queries per Second**: XXX QPS
- 💿 **Database Size**: XX GB

**Tətbiq Metrikaları:**
- 👥 **Active Users**: XXX users
- 📞 **API Calls**: XXXX calls/hour
- 🚨 **Error Rate**: X.X% (threshold: 1%)
- ⏳ **Response Time**: XXX ms (threshold: 500ms)

#### 🚨 Xəbərdarlıq Konfiqurasiyası
**Threshold-based Alerts:**
1. **"Monitoring"** səhifəsinə keçin
2. **"Alert Rules"** düyməsinə basın
3. **Yeni Alert Rule:**
   - **Metric**: CPU usage, Memory, Response time...
   - **Threshold**: Kritik səviyyə
   - **Duration**: Neçə müddət davam etməlidir
   - **Notification**: E-poçt, Slack, SMS

**Alert Channels:**
- 📧 **E-poçt**: admin@infoline.az
- 💬 **Slack**: #infoline-alerts
- 📱 **SMS**: +994XXXXXXXXX

### Log İdarəetməsi

#### 📋 Log Kategoriyaları
**System Logs:**
- Application logs
- Error logs  
- Access logs
- Audit logs

**User Activity Logs:**
- Login/logout events
- Data entry activities
- Admin operations
- Permission changes

#### 🔍 Log Analizi
1. **"Logs"** səhifəsinə keçin
2. **Filtrlər:**
   - Tarix aralığı
   - Log səviyyəsi (Error, Warning, Info)
   - İstifadəçi ID
   - IP ünvan
   - Action type
3. **Export Options:**
   - CSV format
   - JSON format
   - Real-time streaming

---

## 💾 Backup və Recovery

### Avtomatik Backup Sistemi

#### 🔄 Backup Strategiyası
**Backup Types:**
- **Full Backup**: Həftəlik (bazar günü 02:00)
- **Incremental Backup**: Gündəlik (hər gecə 02:00)
- **Transaction Log Backup**: Hər 15 dəqiqədə

**Backup Locations:**
- **Primary**: Supabase internal backup
- **Secondary**: External cloud storage (AWS S3/Google Cloud)
- **Tertiary**: Local backup server

#### 📋 Backup Monitorinq
1. **"Backup"** səhifəsinə keçin
2. **Backup Status:**
   - Son backup tarixi
   - Backup ölçüsü
   - Success/failure status
   - Next scheduled backup

**Backup Verification:**
- Integrity check: SHA-256 hash
- Test restore: Həftəlik
- Recovery time objective (RTO): 4 hours
- Recovery point objective (RPO): 15 minutes

### Disaster Recovery

#### 🚨 Recovery Procedures
**Data Recovery:**
1. **"Recovery"** bölməsinə keçin
2. **"Point-in-Time Recovery"** seçin
3. Target tarix və vaxt
4. Recovery scope (full/partial)
5. **"Start Recovery"** düyməsinə basın

**System Recovery:**
- Full system restore
- Database restore only
- Configuration restore
- User data restore

#### 📞 Emergency Contacts
**24/7 Emergency Response:**
- Primary: +994XXXXXXXXX
- Secondary: +994XXXXXXXXX
- Technical: support@infoline.az
- Management: admin@infoline.az

---

## 📊 Hesabat və Analytics

### Hərtərəfli Sistem Hesabatları

#### 📈 Executive Dashboard
**Strateji Metrikalar:**
- 🎯 **Overall System Health**: XX%
- 📊 **Data Completion Rate**: XX%
- 👥 **User Engagement**: XX%
- ⏱️ **System Performance**: XX ms avg response

**Business Intelligence:**
- Regional performance comparison
- Trend analysis (monthly/quarterly)
- Predictive analytics
- ROI calculations

#### 📋 Operational Reports
**Gündəlik Operasional Hesabat:**
1. **"Hesabatlar"** səhifəsinə keçin
2. **"Avtomatik Hesabatlar"** bölməsi
3. **Gündəlik Report:**
   - User activity summary
   - Data entry statistics
   - System performance metrics
   - Error summary

**Həftəlik Management Report:**
- Performance trends
- User engagement analysis
- Regional comparison
- Issue summary və resolution

**Aylıq Executive Report:**
- Strategic KPI dashboard
- Growth metrics
- Quality indicators
- Future recommendations

### Custom Analytics

#### 🔍 Advanced Analytics
**Data Mining:**
1. **"Analytics"** bölməsinə keçin
2. **"Custom Query Builder"** düyməsinə basın
3. SQL query builder interface
4. **Parametrlər:**
   - Data sources
   - Time ranges
   - Aggregation functions
   - Visualization type

**Predictive Analytics:**
- Completion prediction models
- User churn analysis
- Performance forecasting
- Anomaly detection

---

## 🚨 Fövqəladə Hallar və Troubleshooting

### Krisis İdarəetməsi

#### 🚨 Sistem Down Proseduru
**Immediate Response (0-15 dəqiqə):**
1. **Status Check**: System health dashboard
2. **Alert Team**: Technical team notification
3. **Communication**: Stakeholder notification
4. **Initial Assessment**: Impact analysis

**Short-term Response (15-60 dəqiqə):**
1. **Root Cause Analysis**: Log investigation
2. **Immediate Fix**: Hotfix deployment
3. **Service Restoration**: Gradual service recovery
4. **User Communication**: Status page update

**Long-term Response (1+ saat):**
1. **Post-incident Review**: Detailed analysis
2. **Process Improvement**: Prevention measures
3. **Documentation**: Incident report
4. **Team Debriefing**: Lessons learned

#### 🔧 Ümumi Problemlər və Həllər

**Problem 1: Yavaş Performance**
```
Symptoms: Yavaş API response, timeout errors
Diagnosis: High CPU/Memory usage, slow queries
Solution: 
- Database optimization
- Query performance tuning
- Caching implementation
- Load balancing
```

**Problem 2: Verilənlər Bazası Connection Errors**
```
Symptoms: Connection timeout, pool exhaustion
Diagnosis: Too many concurrent connections
Solution:
- Connection pool tuning
- Query optimization
- Database scaling
- Application-level connection management
```

**Problem 3: File Upload Issues**
```
Symptoms: File upload failures, storage errors
Diagnosis: Storage quota exceeded, file size limits
Solution:
- Storage cleanup
- File compression
- CDN configuration
- Quota increase
```

### Proaktiv Monitorinq

#### 📊 Health Check Proseduru
**Gündəlik Health Check (Avtomatik):**
- System uptime verification
- Database connectivity test
- API endpoint testing
- File storage accessibility
- Email service functionality

**Həftəlik Performance Review:**
- Resource utilization analysis
- Query performance review
- User experience metrics
- Security audit

**Aylıq Sistem Audit:**
- Full security scan
- Backup integrity verification
- Database maintenance
- Performance optimization review

---

## 📋 Qısa Reference Guide

### Gündəlik SuperAdmin Checklist

#### 🌅 Səhər Rutini (09:00-09:30):
- [ ] System health dashboard yoxla
- [ ] Gecə xəbərdarlıqlarını review et
- [ ] Backup status yoxla
- [ ] Critical alerts analiz et
- [ ] Performance metrikaları yoxla

#### 🌞 Günorta Review (12:00-12:30):
- [ ] User activity analysis
- [ ] Regional performance review
- [ ] Pending admin requests
- [ ] System resource usage

#### 🌆 Axşam Wrap-up (17:30-18:00):
- [ ] Daily statistics summary
- [ ] Tomorrow's planned maintenance
- [ ] Team handover notes
- [ ] Emergency contact verification

### Həftəlik Operations:
- [ ] Performance optimization review
- [ ] Security patch assessment
- [ ] Database maintenance planning
- [ ] User feedback analysis
- [ ] Regional admin coordination

### Aylıq Strategic Tasks:
- [ ] Comprehensive system audit
- [ ] Strategic planning review
- [ ] Budget and resource planning
- [ ] Stakeholder reporting
- [ ] Technology roadmap update

---

## 📞 Emergency Response

### 24/7 Emergency Contacts

#### Technical Emergency:
- **Primary Engineer**: +994XXXXXXXXX
- **Database Admin**: +994XXXXXXXXX
- **Network Admin**: +994XXXXXXXXX

#### Management Emergency:
- **CTO**: +994XXXXXXXXX
- **Project Manager**: +994XXXXXXXXX
- **Regional Coordinator**: +994XXXXXXXXX

#### External Support:
- **Supabase Support**: support@supabase.io
- **Cloud Provider**: [Provider specific]
- **Domain/DNS**: [DNS provider support]

---

**📚 SuperAdmin Documentation**: Bu təlimat sistemin mürəkkəb idarəetməsi üçün hazırlanmışdır. Mütəmadi yenilənir və versiya kontrolu altındadır.

**🔐 Security Note**: Bu sənəddəki məlumatlar konfidensial olaraq saxlanılmalı və yalnız avtorizasiya edilmiş SuperAdmin-lər tərəfindən istifadə edilməlidir.

**📝 Last Updated**: [Current Date]  
**📊 Document Version**: v1.0  
**✅ Reviewed By**: Technical Team Lead