# Proxy Data Entry Components

Bu qovluq Sector Admin-in məktəb adına məlumat daxil etməsi üçün proxy komponentlərini ehtiva edir.

## Komponent Strukturu

```
dataEntry/
├── hooks/
│   ├── useProxyDataEntry.ts    # Əsas business logic və state idarəetməsi
│   └── index.ts                # Export faylı
├── proxy/
│   ├── ProxyDataEntryHeader.tsx      # Səhifə başlığı və məlumat göstəricisi
│   ├── ProxyFormActions.tsx          # Form düymələri (saxla, təqdim et)
│   ├── ProxyNotificationStatus.tsx   # Status bildirişləri
│   └── index.ts                      # Export faylı
├── core/                       # Mövcud shared komponentlər
│   ├── FormFields.tsx          # Form sahələri
│   ├── AutoSaveIndicator.tsx   # Auto-save göstəricisi
│   └── ...
└── SectorAdminProxyDataEntry.tsx # Əsas container komponenti
```

## İstifadə

### Əsas Komponent
```tsx
import SectorAdminProxyDataEntry from '@/components/dataEntry/SectorAdminProxyDataEntry';

<SectorAdminProxyDataEntry
  schoolId="uuid"
  categoryId="uuid"
  columnId="uuid" // opsional
  onClose={() => {}}
  onComplete={() => {}}
/>
```

### Hook İstifadəsi
```tsx
import { useProxyDataEntry } from '@/components/dataEntry/hooks';

const { 
  formData, 
  handleInputChange, 
  handleSubmit 
} = useProxyDataEntry({
  schoolId,
  categoryId,
  onComplete
});
```

## Xüsusiyyətlər

- ✅ **Modular struktur** - hər komponent ayrıca məsuliyyət daşıyır
- ✅ **Custom hook** - business logic ayrıca hook-da
- ✅ **Auto-save** - 30 saniyə interval ilə avtomatik saxlama
- ✅ **Error handling** - səhv idarəetməsi və retry mexanizmi
- ✅ **TypeScript** - tam tip təhlükəsizliyi
- ✅ **Reusable components** - mövcud komponentlərdən istifadə

## Əsas Fərqlər

**Əvvəl (monolitik):**
- 200+ sətir kod
- Bütün logic bir faylda
- Təkrar kodlar
- Test etmək çətin

**İndi (modular):**
- Hər komponent 50 sətirdən az
- Ayrıca məsuliyyətlər
- Mövcud komponentlərdən istifadə
- Test etmək asan

## Performance Optimallaşdırması

- **React.memo** - lazım olmayan render-lərin qarşısını alır
- **useCallback** - function referenslerinin optimallaşdırılması
- **Query caching** - 5 dəqiqə stale time ilə keşləmə
- **Auto-save throttling** - 30 saniyə interval

## Silinəcək Fayllar

Refactoring tamamlandıqdan sonra silinməli fayllar:
- Köhnə `SectorAdminProxyDataEntry.tsx` (əvvəlki versiya)
