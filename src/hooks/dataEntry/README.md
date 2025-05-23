# Köhnəlmiş Hook-lar (Deprecated)

> **DİQQƏT**: Bu qovluqdakı hook-lar köhnəlmiş və yeni versiyalarla əvəz olunmuşdur.

## Yeni Hook Strukturuna Keçid

InfoLine layihəsində hook strukturu yenidən təşkil edilmişdir. Bu qovluqdakı bütün hook-lar, yeni daha modulyar struktura köçürülmüşdür. Aşağıda köhnə hook-ların yeni qarşılıqları göstərilmişdir:

| Köhnə Hook | Yeni Hook |
| --- | --- |
| `useDataEntryState` | `@/hooks/business/dataEntry/useDataEntryState` |
| `useCategoryData` | `@/hooks/api/categories/useCategoryQuery` |
| `useIndexedData` | `@/hooks/core/useIndexedData` |

## Niyə Dəyişiklik?

Yeni hook quruluşu aşağıdakı üstünlükləri təklif edir:

1. **Təkrarçılığın Azaldılması**: Oxşar funksionallıq təkrar yazılmır
2. **Daha Yaxşı Performans**: React Query ilə veri keşləmə və sorğu optimallaşdırması
3. **Modular Struktur**: Hook-lar funksiyalarına görə ayrılmışdır
4. **Daha Yaxşı Tip Təhlükəsizliyi**: TypeScript tipləri daha yaxşı təşkil edilmişdir
5. **Daha Yaxşı Xəta Emalı**: Standartlaşdırılmış xəta emalı sistemi

## Yeni Hook-ları Necə İstifadə Etməli?

Ətraflı dokumentasiya və istifadə nümunələri üçün `/src/hooks/README.md` faylına baxın.

## Test İmkanı

Yeni hook quruluşunu test etmək üçün, Forms səhifəsində bir test komponenti əlavə edilmişdir. Bu komponenti açmaq üçün Forms səhifəsində "Test Komponenti" tabına keçin.
