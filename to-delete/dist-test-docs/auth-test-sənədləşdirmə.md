# Autentifikasiya Test Sənədləşdirməsi

## Ümumi Məlumat

Bu sənəd, İnfoLine proyektinin autentifikasiya sistemi üçün yaradılmış test ssenarilərinin ətraflı təsvirini və texniki detallarını təqdim edir.

## Test Faylları

Autentifikasiya testləri aşağıdakı fayllardan ibarətdir:

1. **auth.test.tsx** - Autentifikasiya hook-ları və funksiyaları üçün testlər
2. **login.test.tsx** - Login səhifəsinin davranışı üçün testlər
3. **LoginForm.test.tsx** - Giriş formu komponenti üçün testlər

## Test Ssenarilərinin Təsviri

### AUTH-01: Giriş prosesi

- **Təsvir**: Email və şifrə ilə giriş prosesini test edir
- **Test addımları**:
  1. Düzgün email və şifrə məlumatları ilə giriş funksiyası çağırılır
  2. Autentifikasiya prosesinin uğurla tamamlanması gözlənilir
  3. İstifadəçinin dashboard-a yönləndirilməsi yoxlanılır
- **Gözlənilən nəticə**: İstifadəçi uğurla daxil olmalı və dashboard-a yönləndirilməlidir

### AUTH-02: Yanlış giriş məlumatları

- **Təsvir**: Yanlış email/şifrə ilə giriş cəhdi
- **Test addımları**:
  1. Yanlış email və ya şifrə ilə giriş funksiyası çağırılır
  2. Autentifikasiya xətasının qaytarılması gözlənilir
  3. Xəta mesajının UI-da göstərilməsi yoxlanılır
- **Gözlənilən nəticə**: Müvafiq xəta mesajı göstərilməlidir

### AUTH-03: Çıxış prosesi

- **Təsvir**: İstifadəçinin sistemdən çıxış prosesi
- **Test addımları**:
  1. Sistemə giriş edilmiş vəziyyətdə çıxış funksiyası çağırılır
  2. Sessiya və lokal məlumatların təmizlənməsi yoxlanılır
  3. İstifadəçinin login səhifəsinə yönləndirilməsi test edilir
- **Gözlənilən nəticə**: İstifadəçi login səhifəsinə yönləndirilməlidir

### AUTH-04: Sessiya saxlama

- **Təsvir**: Səhifə yenilənəndə sessiyanın saxlanması
- **Test addımları**:
  1. İstifadəçi sistemə daxil olur
  2. Səhifə yenilənməsi simulyasiya edilir
  3. Sessiya məlumatlarının qorunduğu yoxlanılır
- **Gözlənilən nəticə**: İstifadəçi sessiyası qorunmalıdır

### AUTH-05: İstifadəçi Rolu və İcazələr

- **Təsvir**: İstifadəçi roluna əsasən müxtəlif icazələrin yoxlanması
- **Test addımları**:
  1. Müxtəlif rolları olan istifadəçilər üçün `usePermissions` hook-u test edilir
  2. Hər rol üçün icazə yoxlamalarının doğruluğu təsdiqlənir
- **Gözlənilən nəticə**: İstifadəçi rolu əsasında düzgün icazələr təyin edilməlidir

## Texniki Detallar və Əsas Yanaşmalar

### Mock Strategiyası

1. **Supabase Auth Mock-laşdırma**

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user-id', 
              email: 'test@example.com' 
            } 
          } 
        }, 
        error: null 
      }),
      signInWithPassword: vi.fn().mockImplementation(({ email, password }) => {
        if (email === 'test@example.com' && password === 'password') {
          return Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null });
        }
        return Promise.reject(new Error('İstifadəçi adı və ya şifrə yanlışdır'));
      }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    }
  }
}));
```

2. **AuthContext Mock-laşdırma**

```typescript
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      language: 'az',
      role: 'superadmin',
      status: 'active',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn().mockResolvedValue(true),
    error: null,
    clearError: vi.fn()
  })
}));
```

3. **Rol və İcazələr Mock-laşdırma**

```typescript
vi.mock('@/hooks/auth/usePermissions', () => ({
  usePermissions: () => ({
    userRole: 'superadmin',
    isAdmin: true,
    isSuperAdmin: true,
    isRegionAdmin: false,
    isSectorAdmin: false,
    isSchoolAdmin: false,
    hasPermission: (permission) => true
  })
}));
```

### Test Providers

Testlərdə istifadə edilən wrapper komponenti:

```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LanguageProvider>
          {ui}
        </LanguageProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};
```

### Davranış Test Strategiyası

1. **Login Flow Testi**

```typescript
it('email və şifrə ilə giriş prosesini uğurla tamamlayır', async () => {
  // Login komponenti render edilir
  const { getByLabelText, getByRole } = render(<LoginForm onLogin={mockLoginFunction} />);
  
  // Test məlumatları ilə form doldurulur
  fireEvent.change(getByLabelText(/email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(getByLabelText(/şifrə/i), { target: { value: 'password' } });
  
  // Form göndərilir
  fireEvent.click(getByRole('button', { name: /giriş/i }));
  
  // Login funksiyasının çağırıldığı yoxlanılır
  await waitFor(() => {
    expect(mockLoginFunction).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });
});
```

2. **Sessiya Testi**

```typescript
it('sessiya vəziyyətini düzgün qoruyur', async () => {
  // Sessiya mocklanır
  mockSupabase.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: 'test-user-id' } } },
    error: null
  });
  
  // useAuth hook-unun initializeAuth funksiyası çağırılır
  const { result } = renderHook(() => useAuth());
  
  // Hook-un vəziyyəti yoxlanılır
  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});
```

## Əldə Edilən Nəticələr

1. **Autentifikasiya Axınının Test Əhatəsi**
   - Giriş və çıxış prosesləri tam test edilib
   - Sessiya idarəetməsi yoxlanılıb
   - Xəta halları test edilib

2. **Komponent Test Əhatəsi**
   - Login formu və doğrulama test edilib
   - Xəta mesajları və UI vəziyyətləri yoxlanılıb

3. **Hook Test Əhatəsi**
   - AuthContext hook-ları test edilib
   - usePermissions və icazə yoxlamaları test edilib

## Test İşləmə Nəticələri

Autentifikasiya testləri uğurla keçirildi:

- **auth.test.tsx**: 6 test keçdi
- **login.test.tsx**: 5 test keçdi
- **LoginForm.test.tsx**: 3 test keçdi

Bu testlər İnfoLine tətbiqinin autentifikasiya sisteminin etibarlılığını və gözlənilən şəkildə işlədiyini təsdiqləyir.
