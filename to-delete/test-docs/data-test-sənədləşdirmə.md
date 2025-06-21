# Məlumat Daxiletmə və Təsdiqləmə Test Sənədləşdirməsi

## Ümumi Məlumat

Bu sənəd, İnfoLine layihəsində məlumat daxil etmə, import və təsdiqləmə funksionallıqları üçün implementasiya edilmiş test ssenarilərini ətraflı təsvir edir.

## 1. Məlumat Daxiletmə və İmport Testləri

### Test Faylı: `data-entry.test.tsx`

#### Test Ssenarilərinin Təsviri

1. **Manuel məlumat daxiletmə (DATA-01)**
   - Forma vasitəsilə məlumatların daxil edilməsi və saxlanmasını test edir
   - `useDataEntry` hook-unun `saveEntry` funksiyasının düzgün çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumatlar uğurla yadda saxlanılır

2. **Excel faylı import (DATA-02)**
   - Excel faylının yüklənməsi və məlumatların ixrac edilməsini test edir
   - `importExcel` funksiyasının düzgün çağırıldığını və nəticə qaytardığını yoxlayır
   - Gözlənilən nəticə: Fayl məlumatları sistemə uğurla import edilir

3. **Import xətaları (DATA-03)**
   - Yanlış format və ya məzmuna malik faylların import prosesini test edir
   - Xəta hallarının düzgün emal edilməsini təmin edir
   - Gözlənilən nəticə: Müvafiq xəta mesajı və uğursuz import haqqında məlumat

4. **Məlumat validasiyası (DATA-04)**
   - Daxil edilən məlumatların validasiya qaydalarına uyğunluğunu test edir
   - Məcburi xanaların boş olduğu halda xəta qaytarılmasını yoxlayır
   - Gözlənilən nəticə: Validasiya xətaları düzgün şəkildə qaytarılır

5. **Məlumat redaktəsi (DATA-05)**
   - Mövcud daxil edilmiş məlumatların redaktə prosesini test edir
   - `updateEntry` funksiyasının düzgün parametrlərlə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumatların yenilənməsi uğurla həyata keçirilir

6. **Məlumat silmə (DATA-06)**
   - Mövcud məlumatların silinməsi prosesini test edir
   - `deleteEntry` funksiyasının çağırılmasını və nəticəsini yoxlayır
   - Gözlənilən nəticə: Məlumatlar uğurla silinir

### Texniki Detallar

1. **Hook Mock Strategiyası**

```typescript
vi.mock('@/hooks/dataEntry/useDataEntry', () => ({
  useDataEntry: () => ({
    entries: [
      {
        id: 'entry-1',
        school_id: 'school-1',
        category_id: 'category-1',
        created_at: new Date().toISOString(),
        status: 'draft',
        data: {
          'column-1': 'Test Məktəb',
          'column-2': 100
        }
      }
    ],
    isLoading: false,
    error: null,
    fetchEntries: vi.fn().mockResolvedValue(true),
    saveEntry: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'entry-123', ...data })),
    updateEntry: vi.fn().mockResolvedValue(true),
    deleteEntry: vi.fn().mockResolvedValue(true),
    importExcel: vi.fn().mockImplementation(() => Promise.resolve({ 
      success: true, 
      importedCount: 10, 
      failedCount: 0 
    }))
  })
}));
```

2. **Komponent Mock Strategiyası**

```typescript
vi.mock('@/components/dataEntry/DataEntryForm', () => {
  const DataEntryForm = ({ onSubmit, categoryId, initialData }: any) => {
    return (
      <div data-testid="data-entry-form">
        <input 
          data-testid="field-column-1" 
          type="text" 
          defaultValue={initialData ? initialData['column-1'] : ''} 
        />
        <input 
          data-testid="field-column-2" 
          type="number" 
          defaultValue={initialData ? initialData['column-2'] : ''} 
        />
        <button 
          data-testid="data-submit-button"
          onClick={() => onSubmit({...})}
        >
          Göndər
        </button>
      </div>
    );
  };
  return { default: DataEntryForm };
});
```

## 2. Məlumat Təsdiqi və Toplama Testləri

### Test Faylı: `data-approval.test.tsx`

#### Test Ssenarilərinin Təsviri

1. **Məlumat təsdiqi (məktəb admin) (APPR-01)**
   - Məktəb admin tərəfindən məlumatların təsdiqlənməsi prosesini test edir
   - `approveEntry` funksiyasının düzgün parametrlərlə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumat statusu "school_approved" olmalıdır

2. **Məlumat təsdiqi (sektor admin) (APPR-02)**
   - Sektor admin tərəfindən məlumatların təsdiqlənməsi prosesini test edir
   - `approveEntry` funksiyasının "sectoradmin" rolu ilə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumat statusu "sector_approved" olmalıdır

3. **Məlumat təsdiqi (region admin) (APPR-03)**
   - Region admin tərəfindən məlumatların təsdiqlənməsi prosesini test edir
   - `approveEntry` funksiyasının "regionadmin" rolu ilə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumat statusu "region_approved" olmalıdır

4. **Məlumat qaytarma (APPR-04)**
   - Məlumatın düzəliş üçün qaytarılması prosesini test edir
   - `returnEntry` funksiyasının düzgün parametrlərlə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Məlumat statusu "returned" olmalıdır

5. **Statuslar üzrə filtrasiya (APPR-05)**
   - Müxtəlif təsdiq statuslarına görə məlumatların filtrasiyasını test edir
   - `filterByStatus` funksiyasının düzgün çağırıldığını və nəticəsini yoxlayır
   - Gözlənilən nəticə: Hər statusa uyğun məlumatlar düzgün filtrlənir

6. **Toplu təsdiq (APPR-06)**
   - Birdən çox məlumatın eyni zamanda təsdiqlənməsi prosesini test edir
   - `bulkApprove` funksiyasının çağırılmasını və nəticəsini yoxlayır
   - Gözlənilən nəticə: Bütün seçilmiş məlumatlar təsdiqlənir

### Texniki Detallar

1. **Hook Mock Strategiyası**

```typescript
vi.mock('@/hooks/approval/useApprovalData', () => ({
  useApprovalData: () => ({
    entries: mockEntries,
    isLoading: false,
    error: null,
    fetchEntries: vi.fn().mockResolvedValue(mockEntries),
    fetchEntryById: vi.fn().mockImplementation((id) => 
      Promise.resolve(mockEntries.find(e => e.id === id))
    ),
    approveEntry: vi.fn().mockImplementation((id, role) => {
      const newStatus = role === 'schooladmin' 
        ? ApprovalStatus.SCHOOL_APPROVED 
        : role === 'sectoradmin' 
          ? ApprovalStatus.SECTOR_APPROVED 
          : ApprovalStatus.REGION_APPROVED;
      
      return Promise.resolve({
        success: true,
        id,
        status: newStatus,
        message: 'Məlumatlar uğurla təsdiqləndi'
      });
    }),
    // digər funksiyalar...
  })
}));
```

2. **Mock Data Strukturu**

```typescript
const mockEntries = [
  {
    id: 'entry-1',
    school_id: 'school-1',
    sector_id: 'sector-1',
    region_id: 'region-1',
    category_id: 'category-1',
    created_at: new Date().toISOString(),
    created_by: 'user-123',
    updated_at: new Date().toISOString(),
    status: ApprovalStatus.DRAFT,
    data: {
      'column-1': 'Test Məktəb',
      'column-2': 100
    }
  },
  // digər məlumatlar...
];
```

3. **İstifadəçi Rollarına Görə Təstiq Axını**

Sistem hər rol üçün müxtəlif təsdiq axını təklif edir:

- Məktəb admin: draft -> school_approved
- Sektor admin: school_approved -> sector_approved
- Region admin: sector_approved -> region_approved

Hər bir təsdiq mərhələsində məlumatları "returned" statusuna qaytarmaq da mümkündür.

## Əldə Edilmiş Nəticələr

1. **Məlumat Daxiletmə Testləri**
   - Bütün əsas məlumat daxiletmə funksiyaları test edildi
   - Form təsdiqləmə və validasiya prosesləri yoxlanıldı
   - Excel import prosesi müxtəlif ssenarilərdə test edildi

2. **Məlumat Təsdiq Testləri**
   - Üç səviyyəli təsdiq prosesi (məktəb, sektor, region) test edildi
   - Rollar arası təsdiq axını yoxlanıldı
   - Filtrasiya və toplu əməliyyat funksiyaları test edildi

3. **Test Əhatə Dairəsi**
   - Funksional testlər: Bütün funksiyalar və əməliyyatlar
   - İstifadəçi rolları: Bütün rol tipləri (məktəb, sektor, region adminləri)
   - Xəta hallrı: Validasiya xətaları və yanlış format halları

## Gələcək Təkmilləşdirmələr

1. **İnteqrasiya Testləri**
   - Məlumat daxiletmə və təsdiq proseslərini bir axın olaraq test etmək
   - Real istifadəçi ssenarilərini simulyasiya edən daha mürəkkəb test halları

2. **Performans Testləri**
   - Böyük məlumat həcmlərində sistemin davranışının test edilməsi
   - Müxtəlif ölçülü Excel fayllarının import zamanı performansın yoxlanması

3. **Təhlükəsizlik Testləri**
   - Rola əsaslanan icazələrin daha ətraflı test edilməsi
   - Cross-region, cross-sector və cross-school məlumat əlçatanlığının yoxlanması
