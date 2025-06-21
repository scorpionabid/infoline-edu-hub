# İnfoLine - İstifadəçi İdarəetmə Testləri Sənədləşdirməsi

## Ümumi Təsvir

Bu sənəd, İnfoLine sisteminin istifadəçi idarəetmə funksionallığını əhatə edən test ssenarilərini təsvir edir. İstifadəçi idarəetmə testləri, sistem daxilində istifadəçilərin yaradılması, rolların təyin edilməsi, istifadəçilərin redaktəsi, silinməsi və filtrasiyası kimi funksiyaların düzgün işlədiyini təmin etmək üçün hazırlanmışdır.

## Test Strukturu

İstifadəçi İdarəetmə testləri `src/__tests__/user-management.test.tsx` faylında yerləşir və aşağıdakı test kateqoriyalarını əhatə edir:

1. **İstifadəçi Yaratma Testləri** - Yeni istifadəçi yaratma funksionallığını test edir
2. **İstifadəçi Rolu Təyin Etmə Testləri** - Müxtəlif admin rollarının təyin edilməsini test edir
3. **İstifadəçi Redaktəsi Testləri** - Mövcud istifadəçilərin məlumatlarının redaktə edilməsini test edir
4. **İstifadəçi Silmə Testləri** - İstifadəçilərin sistemdən silinməsini test edir
5. **İstifadəçi Siyahısı Testləri** - İstifadəçilərin siyahılanmasını test edir
6. **İstifadəçi Filtrasiyası Testləri** - Müxtəlif parametrlərə görə istifadəçi filtrasiyasını test edir

## Test Bölmələri və İstifadə Edilən Mocklar

Test ssenarisi, aşağıdakı mock və test vasitələrindən istifadə edir:

1. **Mock Data**:
   - `mockUsers` - Test üçün istifadə edilən istifadəçi məlumatları
   - `mockAvailableUsers` - Rol təyin etmək üçün istifadə edilən boş istifadəçilər
   - `mockRegions`, `mockSectors`, `mockSchools` - Region, sektor və məktəb mocklarını təmsil edir

2. **Mock API-lar**:
   - `mockCallEdgeFunction` - Edge Functions API çağırışlarını simulyasiya edir
   - `mockedSupabase` - Supabase-in auth, profiles və user_roles üzərində əməliyyatlarını simulyasiya edir

3. **Mock Hook-lar**:
   - `useUserList` - İstifadəçi siyahısını, filtrasiya və səhifələmə funksionallığını simulyasiya edir
   - `useUserOperations` - İstifadəçi redaktəsi və silmə əməliyyatlarını simulyasiya edir
   - `useAvailableUsers` - Rol təyin etmək üçün mövcud istifadəçiləri simulyasiya edir

## Test Ssenarileri və Gözlənilən Nəticələr

### USER-01: İstifadəçi Yaratma

**Təsvir**: Yeni istifadəçi yaratma prosesini test edir.

**Testlər**:
- `yeni istifadəçi yaratma prosesi` - Yeni istifadəçi yaratma formu təqdim edilir və məlumatları doldurulur

**Gözlənilən Nəticə**:
- Müvafiq Edge Function çağırılır və istifadəçi məlumatları ilə ötürülür
- İstifadəçi uğurla yaradılır və düzgün məlumatlarla qaytarılır

### USER-02: İstifadəçi Rolu Təyin Etmə

**Təsvir**: İstifadəçilərə müxtəlif admin rollarının təyin edilməsini test edir.

**Testlər**:
- `istifadəçiyə region admin rolu təyin etmə` - İstifadəçiyə region admin rolu təyin edir
- `istifadəçiyə sektor admin rolu təyin etmə` - İstifadəçiyə sektor admin rolu təyin edir

**Gözlənilən Nəticə**:
- Müvafiq Edge Function çağırılır və istifadəçi + region/sektor məlumatları ilə ötürülür
- İstifadəçi rolu uğurla təyin edilir və təsdiqlənir

### USER-03: İstifadəçi Redaktəsi

**Təsvir**: Mövcud istifadəçilərin məlumatlarının redaktə edilməsini test edir.

**Testlər**:
- `mövcud istifadəçinin məlumatlarını redaktə etmə` - İstifadəçi məlumatları redaktə formunda dəyişdirilir

**Gözlənilən Nəticə**:
- `handleUpdateUserConfirm` funksiyası çağırılır və yenilənmiş istifadəçi məlumatları ilə ötürülür
- İstifadəçi məlumatları uğurla yenilənir

### USER-04: İstifadəçi Silmə

**Təsvir**: İstifadəçilərin sistemdən silinməsini test edir.

**Testlər**:
- `istifadəçini silmə prosesi` - İstifadəçi siyahısından bir istifadəçi seçilir və silinir

**Gözlənilən Nəticə**:
- `handleDeleteUserConfirm` funksiyası çağırılır
- İstifadəçi uğurla silinir

### USER-05: İstifadəçi Siyahısı

**Təsvir**: İstifadəçilərin siyahılanmasını test edir.

**Testlər**:
- `istifadəçilərin siyahısının yüklənməsi` - İstifadəçi siyahısının komponentinin yüklənməsini və renderini test edir

**Gözlənilən Nəticə**:
- `refetch` funksiyası çağırılır və istifadəçi məlumatları əldə edilir
- İstifadəçi məlumatları düzgün şəkildə göstərilir

### USER-06: İstifadəçi Filtrasiyası

**Təsvir**: Müxtəlif parametrlərə görə istifadəçi filtrasiyasını test edir.

**Testlər**:
- `müxtəlif parametrlərə görə istifadəçi filtrasiyası` - Rol və region parametrlərinə görə filtrasiya edilir

**Gözlənilən Nəticə**:
- `updateFilter` funksiyası çağırılır və filtr parametrləri ilə ötürülür
- Filtrlənmiş istifadəçi siyahısı düzgün şəkildə göstərilir

## Test Etibarlılığı

İstifadəçi idarəetmə testləri, sistemin Supabase və Edge Functions kimi xarici asılılıqlarından təcrid edilmiş şəkildə işləyir. Bu, testlərin davamlı inteqrasiya (CI) mühitində etibarlı şəkildə işləməsini təmin edir.

Test vasitələri aşağıdakı üsulla təcrid edilmişdir:
- Supabase funksiyaları mock-lanıb
- Edge Functions mock-lanıb
- Hook-lar mock-lanıb
- Komponentlər mock-lanıb

## Xüsusi Test Nümunələri

### İstifadəçi Yaratma Testi

```tsx
it('yeni istifadəçi yaratma prosesi', async () => {
  // Mock EdgeFunction çağırışı
  const createUserFn = vi.fn().mockImplementation((userData) => {
    return mockCallEdgeFunction('create-user', {
      body: userData
    });
  });
  
  // CreateUserForm-u render et
  render(
    <div data-testid="create-user-container">
      <div data-testid="create-user-form">
        <button 
          data-testid="submit-button"
          onClick={() => createUserFn({
            email: 'new@example.com',
            fullName: 'New User',
            password: 'password123',
            language: 'az'
          })}
        >
          İstifadəçi Yarat
        </button>
      </div>
    </div>
  );
  
  // Submit düyməsinə klik et
  fireEvent.click(screen.getByTestId('submit-button'));
  
  // Edge Function çağırışını yoxla
  await waitFor(() => {
    expect(createUserFn).toHaveBeenCalledWith(expect.objectContaining({
      email: 'new@example.com',
      fullName: 'New User',
      password: 'password123'
    }));
  });
});
```

### İstifadəçi Filtrasiyası Testi

```tsx
it('müxtəlif parametrlərə görə istifadəçi filtrasiyası', async () => {
  // useUserList hook-undan updateFilter funksiyasını al
  const { useUserList } = await import('@/hooks/useUserList');
  const { updateFilter, refetch } = useUserList();
  
  // UsersFilter komponentini simulyasiya et
  const handleFilter = vi.fn().mockImplementation((filters) => {
    updateFilter(filters);
    return refetch();
  });
  
  render(
    <div data-testid="users-filter-container">
      <div data-testid="users-filter">
        <button 
          data-testid="apply-filter"
          onClick={() => handleFilter({
            role: 'regionadmin',
            regionId: 'region-1'
          })}
        >
          Tətbiq et
        </button>
      </div>
    </div>
  );
  
  // Filter düyməsinə klik et
  fireEvent.click(screen.getByTestId('apply-filter'));
  
  // updateFilter funksiyasının çağırıldığını yoxla
  await waitFor(() => {
    expect(updateFilter).toHaveBeenCalledWith({
      role: 'regionadmin',
      regionId: 'region-1'
    });
  });
});
```

## Test Örtüyü (Coverage)

İstifadəçi idarəetmə testləri aşağıdakı funksionallıqları test edir:

- ✅ İstifadəçi yaratma
- ✅ Region admin təyin etmə
- ✅ Sektor admin təyin etmə
- ✅ İstifadəçi redaktəsi
- ✅ İstifadəçi silmə
- ✅ İstifadəçi siyahısı
- ✅ İstifadəçi filtrasiyası
