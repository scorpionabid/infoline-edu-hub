# 📊 İnfoLine Reports Səhifəsi İmplementasiya Planı

Bu sənəd İnfoLine sistemində Reports səhifəsinin tam funksional həllə çevrilməsi üçün ətraflı plan təqdim edir.

## 🎯 Məqsəd və Vəziyyət Analizi

### 📝 Hal-hazırda Reports səhifəsinin vəziyyəti:
- ✅ **Təknik olaraq aktiv** - Route və Sidebar konfiqurasiyası tamamlandı
- ⚡ **Mock data istifadə edir** - Real verilənlər bazası sorğuları yoxdur
- 🎨 **3 əsas tab mövcuddur**: Advanced Reporting, School Column Reports, Report Templates
- 🔧 **Komponentlər hazırdır**, lakin real data inteqrasiyası yoxdur

### 📊 Mövcud Verilənlər Bazası Strukturu:
- `reports` cədvəli - yaradılmış hesabatlar
- `report_templates` cədvəli - hesabat şablonları  
- `data_entries` cədvəli - 600+ məktəbin məlumatları
- `schools`, `sectors`, `regions` cədvəlləri - təşkilati struktur
- `categories`, `columns` cədvəlləri - məlumat strukturu

## 🚀 Həllləşdirməli Problemlər

### 1. **Real Data İnteqrasiyası**
- **Problem**: Mock data əvəzinə Supabase-dən real məlumat çəkmək
- **Həll**: Supabase RPC funksiyaları və optimallaşdırılmış sorğular

### 2. **Hesabat Növlərinin Genişləndirilməsi**
- **Problem**: Məhdud hesabat növləri
- **Həll**: Məktəb performans, regional müqayisə, kategory əsaslı hesabatlar

### 3. **Rol Əsaslı Məhdudiyyətlar**
- **Problem**: Bütün istifadəçilər eyni məlumatlara giriş
- **Həll**: RLS siyasətləri əsaslı filtrləmə

### 4. **Performance Optimallaşdırması**
- **Problem**: 600+ məktəb üçün ləng hesabat yüklənməsi
- **Həll**: Keşləmə, indeksləşdirmə, pagination

## 📋 Həyata Keçirmə Planı

### **Faza 1: Real Data İnteqrasiyası (2 gün)**

#### A. Supabase Sorğularının Yazılması
**Yeni fayl**: `src/hooks/reports/useReportsData.ts`

#### B. PostgreSQL RPC Functions
```sql
-- get_school_performance_report
CREATE OR REPLACE FUNCTION get_school_performance_report(
  p_region_id uuid DEFAULT NULL,
  p_sector_id uuid DEFAULT NULL,
  p_date_from date DEFAULT NULL,
  p_date_to date DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'school_id', s.id,
        'school_name', s.name,
        'completion_rate', s.completion_rate,
        'total_entries', entry_stats.total,
        'approved_entries', entry_stats.approved,
        'pending_entries', entry_stats.pending,
        'rejected_entries', entry_stats.rejected,
        'region_name', r.name,
        'sector_name', sec.name
      )
    )
    FROM schools s
    JOIN regions r ON s.region_id = r.id
    JOIN sectors sec ON s.sector_id = sec.id
    LEFT JOIN LATERAL (
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM data_entries de 
      WHERE de.school_id = s.id
        AND (p_date_from IS NULL OR de.created_at >= p_date_from)
        AND (p_date_to IS NULL OR de.created_at <= p_date_to)
    ) entry_stats ON true
    WHERE 
      (p_region_id IS NULL OR s.region_id = p_region_id)
      AND (p_sector_id IS NULL OR s.sector_id = p_sector_id)
      AND s.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Faza 2: Rol Əsaslı Filtrləmə (1 gün)**

**Yeni fayl**: `src/hooks/reports/useRoleBasedReports.ts`
- SuperAdmin: Bütün məlumatlara giriş
- RegionAdmin: Yalnız öz regionu
- SectorAdmin: Yalnız öz sektoru
- SchoolAdmin: Yalnız öz məktəbi

### **Faza 3: Export Funksionallığı (2 gün)**

**Yeni fayl**: `src/services/reports/exportService.ts`
- Excel (.xlsx) export
- PDF export
- CSV export

**Yeni komponent**: `src/components/reports/ExportButtons.tsx`

### **Faza 4: Advanced Analytics (3 gün)**

- Dashboard statistikaları
- İnteraktiv qrafiklər
- Trend analizləri
- Visual analytics komponentləri

### **Faza 5: Template Management (2 gün)**

- Template CRUD əməliyyatları
- Template builder UI
- Public/private template sistemi

## 🔧 Texniki Detallar

### Database İndeksləşdirmə
```sql
-- Performans üçün indekslər
CREATE INDEX CONCURRENTLY idx_data_entries_school_status 
  ON data_entries(school_id, status);

CREATE INDEX CONCURRENTLY idx_data_entries_created_at 
  ON data_entries(created_at DESC);

CREATE INDEX CONCURRENTLY idx_schools_region_sector 
  ON schools(region_id, sector_id) WHERE status = 'active';
```

### RLS Siyasətləri
```sql
-- Reports cədvəli üçün RLS
CREATE POLICY "Users can view reports based on role" ON reports
  FOR SELECT TO authenticated
  USING (
    is_superadmin() OR
    (role-based conditions...)
  );
```

## 📈 Performans Strategiyası

### 1. Keşləmə Sistemi
**Yeni fayl**: `src/utils/reportCache.ts`
- 5 dəqiqəlik cache TTL
- LRU cache əvəzləməsi
- Parametre əsaslı cache keys

### 2. Pagination
**Yeni fayl**: `src/hooks/reports/useReportPagination.ts`
- 50 sətr per page default
- Lazy loading
- Efficient pagination queries

### 3. Real-time Refresh
**Yeni fayl**: `src/hooks/reports/useRealtimeReports.ts`
- Supabase realtime subscriptions
- Automatic cache invalidation
- User notifications

## 🧪 Test Strategiyası

### Unit Tests
- ReportService.test.ts
- ExportService.test.ts
- Cache.test.ts

### Integration Tests
- ReportsPage.test.tsx
- Export functionality tests
- Role-based access tests

### Performance Tests
- Report loading time < 3 seconds
- Export time < 10 seconds (10K rows)
- Cache efficiency > 80%

## 🎯 Success Metrics

### Performans KPI-ləri
- ✅ **Hesabat yüklənmə vaxtı**: < 3 saniyə
- ✅ **Excel export vaxtı**: < 10 saniyə (10K sətir üçün)
- ✅ **Concurrent istifadəçi**: 100+
- ✅ **Cache hit rate**: > 80%
- ✅ **Database query optimization**: < 500ms ortalama

### Funksional KPI-lər
- ✅ **Bütün hesabat növləri işləyir**
- ✅ **Rol əsaslı məhdudiyyətlar aktiv**
- ✅ **Export funksionallığı stabil** (Excel, PDF, CSV)
- ✅ **Real-time data refresh**
- ✅ **Template management sistemi**
- ✅ **Responsive design** (desktop və mobil)

### İstifadəçi Təcrübəsi KPI-ləri
- **Səhifə açılış sürəti**: < 2 saniyə
- **İnteraktivlik vaxtı**: < 1 saniyə
- **Error rate**: < 1%
- **İstifadəçi məmnuniyyəti**: > 85%

## 📅 İmplementasiya Vaxt Cədvəli

| Faza | Tapşırıqlar | Müddət | Prioritet | Resurslar | Nəticə |
|------|-------------|--------|-----------|-----------|--------|
| **Faza 1** | Real Data İnteqrasiyası | **2 gün** | 🔴 YÜKSƏK | Backend Dev | Supabase sorğuları, RPC funksiyaları |
| | - Supabase sorğularının yazılması | 1 gün | | | |
| | - Mock data əvəzinə real data | 1 gün | | | |
| **Faza 2** | PostgreSQL Functions | **1 gün** | 🔴 YÜKSƏK | DB Admin | Stored procedures, indekslər |
| | - Performance hesabat funksiyaları | 0.5 gün | | | |
| | - Regional müqayisə funksiyaları | 0.5 gün | | | |
| **Faza 3** | Rol Əsaslı Filtrləmə | **1 gün** | 🟡 ORTA | Full-stack Dev | RLS siyasətləri, UI filtrlər |
| | - Role-based data access | 0.5 gün | | | |
| | - UI komponenti yeniləmələri | 0.5 gün | | | |
| **Faza 4** | Export Funksionallığı | **2 gün** | 🟡 ORTA | Frontend Dev | Excel, PDF, CSV export |
| | - Export service yazılması | 1 gün | | | |
| | - Export UI komponentləri | 1 gün | | | |
| **Faza 5** | Advanced Analytics | **3 gün** | 🟢 AŞAĞI | UI/UX + Dev | Dashboard, charts |
| | - Dashboard statistikaları | 1 gün | | | |
| | - Chart komponentləri | 1 gün | | | |
| | - Visual analytics | 1 gün | | | |
| **Faza 6** | Template Management | **2 gün** | 🟢 AŞAĞI | Backend Dev | Template CRUD, builder |
| | - Template management hooks | 1 gün | | | |
| | - Template builder UI | 1 gün | | | |

### 📊 Ümumi Statistika:
- **ÜMUMİ MÜDDƏT**: **11 gün** (2.5 həftə)
- **Kritik path**: Faza 1-3 (4 gün)
- **Total effort**: ~88 saat
- **Risk buffer**: +20% (2.2 əlavə gün)

### 🎯 Milestone-lar:
- **Week 1 End**: Real data inteqrasiyası tamamlanacaq
- **Week 2 Middle**: Export və role-based access hazır olacaq  
- **Week 2.5 End**: Bütün advanced features hazır olacaq

### ⚡ Paralel İş İmkanları:
- Faza 4 və 5 paralel aparıla bilər (2 developer ilə)
- Faza 6 independent olaraq sonradan əlavə edilə bilər
- Test yazma hər fazada paralel aparıla bilər

### 🔧 Development Dependencies:
1. **Faza 1** → **Faza 3** (data layer hazır olmalıdır)
2. **Faza 2** → **Faza 5** (DB functions analytics üçün lazımdır)
3. **Faza 1** → **Faza 4** (real data export üçün lazımdır)

### 🚦 Quality Gates:
- **Faza 1 sonunda**: Unit testlər 100% pass
- **Faza 3 sonunda**: Security audit
- **Faza 5 sonunda**: Performance testing
- **Faza 6 sonunda**: End-to-end testing

## 🔗 Əlaqəli Resurslar

### Texniki Sənədlər
- [Database Schema Document](./database-schema-document.md)
- [Requirements Document](./requirements.md)
- [App Flow Document](./app-flow-document.md)

### Kod Referansları
- Mövcud Reports komponenti: `src/pages/Reports.tsx`
- Mock reports hook: `src/hooks/reports/useAdvancedReports.ts`
- Export utilities: Yaradılacaq

## 📝 İmplementasiya Qeydləri

### Önəmli Nöqtələr
1. **RLS Siyasətləri**: Bütün database functions-da role-based filtering tətbiq edilməlidir
2. **Performance**: 600+ məktəb üçün sorğular optimallaşdırılmalıdır
3. **Cache Strategy**: Real-time data ilə cache balance saxlanmalıdır
4. **Export Security**: Yalnız icazəsi olan məlumatlar export edilməlidir

### Risk Mitigasiyası
- **Database Performance**: İndekslər əvvəlcədən yaradılmalıdır
- **Export Memory**: Böyük fayllar üçün chunk-based export
- **User Experience**: Loading states və error handling
- **Security**: Row-level security testləri

### Next Steps
1. Faza 1-dən başlamaq
2. Database functions-ları Supabase-də test etmək
3. RLS siyasətlərini validate etmək
4. Performance metrics toplamaq

Bu plan Reports səhifəsini tam funksional, performanslı və istifadəçi dostu edəcək. Prioritetlər real data inteqrasiyası və rol əsaslı təhlükəsizlik üzərində qurulub.