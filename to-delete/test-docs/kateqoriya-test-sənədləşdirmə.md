# Kateqoriya və Sütun İdarəetməsi Test Sənədləşdirməsi

## Ümumi Məlumat

Bu sənəd, İnfoLine proyektinin Kateqoriya və Sütun idarəetməsi funksionallığı üçün yaradılmış test ssenarilərinin ətraflı təsvirini və texniki detallarını təqdim edir.

## Test Faylı: `category-management.test.tsx`

### Test Ssenarilərinin Təsviri

1. **Kateqoriya yaratma (CAT-01)**
   - Yeni kateqoriya yaratma prosesini test edir
   - `useCategories` hook-unun `add` funksiyasının düzgün çağırıldığını yoxlayır
   - Gözlənilən nəticə: Kateqoriya uğurla yaradılır və backend-də saxlanılır

2. **Kateqoriya redaktə (CAT-02)**
   - Mövcud kateqoriyanın redaktə prosesini test edir
   - `update` funksiyasının doğru parametrlərlə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Kateqoriya məlumatları yenilənir və dəyişikliklər saxlanılır

3. **Sütun yaratma (CAT-03)**
   - Yeni sütun yaratma prosesini test edir
   - `useColumns` hook-unun `add` funksiyasının düzgün çağırıldığını yoxlayır
   - Gözlənilən nəticə: Sütun müvafiq kateqoriyaya əlavə edilir

4. **Sütun redaktə (CAT-04)**
   - Mövcud sütunun redaktə prosesini test edir
   - `update` funksiyasının doğru parametrlərlə çağırıldığını yoxlayır
   - Gözlənilən nəticə: Sütun xüsusiyyətləri yenilənir və dəyişikliklər saxlanılır

5. **Sütun tipləri və validasiya (CAT-05)**
   - Müxtəlif sütun tiplərinin (mətn, rəqəm, fayl) düzgün işləməsini yoxlayır
   - Hər tip sütunun xüsusiyyətlərini və validasiya qaydalarını test edir
   - Gözlənilən nəticə: Sütunlar tiplərinə uyğun davranış göstərir

6. **Kateqoriya-Sütun əlaqələri (CAT-06)**
   - Sütunların kateqoriyalara düzgün bağlanmasını yoxlayır
   - Kateqoriya və sütun əlaqələrinin doğruluğunu təsdiqləyir
   - Gözlənilən nəticə: Hər sütun düzgün kateqoriyaya aiddir

7. **Kateqoriya icazələrini yeniləmə (CAT-07)**
   - Kateqoriya icazələrinin yenilənməsi prosesini test edir
   - Edge Function çağırışlarının düzgün parametrlərlə edilməsini yoxlayır
   - Gözlənilən nəticə: Kateqoriyaya müxtəlif rollar üçün icazələr təyin edilir

## Texniki Detallar və Əsas Yanaşmalar

### Mock Strategiyası

1. **Hook Mock-laşdırma**
   ```typescript
   vi.mock('@/hooks/categories/useCategories', () => ({
     useCategories: () => ({
       categories: [
         { id: 'category-1', name: 'Ümumi Məlumatlar', description: 'Məktəbin ümumi məlumatları', status: 'active' },
         { id: 'category-2', name: 'Şagird Məlumatları', description: 'Şagirdlərlə bağlı məlumatlar', status: 'active' }
       ],
       isLoading: false,
       error: null,
       fetchCategories: vi.fn().mockResolvedValue(true),
       refresh: vi.fn().mockResolvedValue(true),
       add: vi.fn().mockImplementation((data) => Promise.resolve({ id: 'new-category-id', ...data })),
       update: vi.fn().mockResolvedValue(true),
       remove: vi.fn().mockResolvedValue(true)
     })
   }));
   ```

2. **Komponent Mock-laşdırma**
   ```typescript
   vi.mock('@/components/categories/CategoryForm', () => {
     const CategoryForm = ({ onSubmit, initialData }: any) => {
       return (
         <div data-testid="category-form">
           <button 
             data-testid="category-submit-button"
             onClick={() => onSubmit(initialData ? 
               { ...initialData, name: 'Yeni Ad' } : 
               { name: 'Test Kateqoriya', description: 'Test təsviri' })}
           >
             Əlavə et / Yadda saxla
           </button>
         </div>
       );
     };
     return { default: CategoryForm };
   });
   ```

3. **Edge Function Mock-laşdırma**
   ```typescript
   const mockCallEdgeFunction = vi.fn().mockImplementation((funcName, options) => {
     if (funcName === 'update-category-permissions') {
       return Promise.resolve({ data: { success: true, message: 'Kateqoriya icazələri yeniləndi' }, error: null });
     }
     return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
   });
   ```

### Test Data Strukturu

1. **Kateqoriya Data Modeli**
   ```typescript
   {
     id: string;
     name: string;
     description: string;
     status: 'active' | 'inactive';
   }
   ```

2. **Sütun Data Modeli**
   ```typescript
   {
     id: string;
     name: string;
     description: string;
     data_type: 'text' | 'number' | 'date' | 'select' | 'file';
     category_id: string;
     required: boolean;
     status: 'active' | 'inactive';
   }
   ```

### Test İmplementasiyasının Ümumi Prinsipləri

1. **Test İzolasiyası**
   - Hər test senari bir-birindən asılı olmadan işləyir
   - Testlər arasında vəziyyət paylaşımı olmur
   - `beforeEach` hook-unda mock-lar sıfırlanır

2. **Keçid Axınlarının Təsdiqlənməsi**
   - Form təsdiqləmələri simulyasiya edilir
   - Hook funksiyalarının çağırıldığı yoxlanılır
   - API sorğuları mock-laşdırılır

3. **Asenkron Test Vasitələri**
   - `waitFor` istifadə edilərək asenkron əməliyyatlar gözlənilir
   - Promise-lərə əsaslanan əməliyyatlara düzgün yanaşma
   - Async/await konstruksiyaları vasitəsilə asenkron axın

## Təkmilləşdirmə və Gələcək İşlər

1. **İnteqrasiya Testləri**
   - Kateqoriya və sütun yaratma axınlarını başdan-sona test edən ssenarilər
   - Kateqoriya icazələrinin digər rol-əsaslı funksiyalarla birlikdə test edilməsi

2. **Vizual Testing**
   - UI komponentlərinin görünüşünün və funksionallığının daha ətraflı testləri
   - Sürükləyib-buraxma funksiyaları üçün user interaction testləri

3. **Xəta Ssenarilərinin Genişləndirilməsi**
   - Şəbəkə xətalarının daha ətraflı testləri
   - Formlarda invalid məlumatları idarəetmənin testləri
   - Supabase xətalarının simulyasiyası

## Əldə Edilən Nəticələr

- Bütün əsas kateqoriya və sütun idarəetməsi funksiyaları test edildi
- Mock-lar vasitəsilə hərtərəfli test əhatəsi təmin edildi
- Asenkron əməliyyatlar düzgün şəkildə test edildi
- Test faylı və sənədləşdirmə tamamlandı

Bu test yanaşması ilə, İnfoLine proyektinin kateqoriya və sütun idarəetmə funksionallığının düzgün işlədiyi və gözlənilən davranışı göstərdiyi təsdiq edildi. Gələcək dəyişikliklər üçün bu testlər reqressiya prosesində mühüm rol oynayacaq.
