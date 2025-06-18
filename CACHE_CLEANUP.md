# Mock Data və Cache Təmizləmə Təlimatları

## Problem: Dashboard-da Köhnə/Yanlış Məlumatlar

Əgər dashboard-da real data-dan fərqli rəqəmlər (məsələn, developer tools-da 912 istifadəçi göstərilir) görürsənsə, bu browser cache və ya köhnə local storage məlumatları ola bilər.

## Həll Yolları

### 1. 🛠️ Developer Console Alətləri

Browser console-da aşağıdakı komandaları işə sal:

```javascript
// Tam cache təmizliyi
InfoLineDebug.clearCache()

// Cache məlumatlarını debug et
InfoLineDebug.debugSources()

// Yalnız browser storage təmizlə
InfoLineDebug.clearBrowser()

// Yalnız Supabase cache təmizlə  
InfoLineDebug.clearSupabase()
```

### 2. 🔄 Manuel Browser Təmizliyi

**Chrome/Edge:**
1. F12 → Application tab
2. Storage → Clear site data  
3. Refresh (Ctrl+F5)

**Firefox:**
1. F12 → Storage tab
2. Bütün localStorage/sessionStorage entries-ləri sil
3. Hard refresh (Ctrl+Shift+R)

### 3. 🧹 Production Cache Təmizliyi

```javascript
// localStorage təmizliyi
localStorage.clear()

// sessionStorage təmizliyi  
sessionStorage.clear()

// Səhifəni yenilə
window.location.reload()
```

### 4. 🔍 Data Mənbələrini Yoxla

Real data mənbələri:
- ✅ `useRealDashboardData.ts` - Əsas dashboard hook
- ✅ `DashboardContent.tsx` - Real backend inteqrasiyası
- ✅ Supabase RLS policies - Rol-əsaslı təhlükəsizlik

Köhnə/İstifadə edilməyən:
- ❌ `useDashboard.ts` - Mock data (silinib)
- ❌ LocalStorage cache - Təmizlənməlidir

## Debug Rejimi

Development zamanı əlavə debug məlumatları üçün:

```javascript
// Debug rejimini aktiv et
localStorage.setItem('debug', 'true')

// Dashboard state-ni izlə  
logger.dashboard("Custom message", data)
```

## Produksiya Təmizliyi

Produksiya mühitində verbose log-lar avtomatik olaraq deaktiv edilir. Yalnız vacib xətalar və məlumatlar göstərilir.

## Son Addımlar

1. ✅ Cache təmizlə (`InfoLineDebug.clearCache()`)
2. ✅ Səhifəni refresh et (Ctrl+F5)  
3. ✅ Real data-nın görünməsini yoxla
4. ✅ Developer tools-da Components State-ni yoxla

**Real data 369 İstifadəçi və 352 Məktəb göstərməlidir.**
