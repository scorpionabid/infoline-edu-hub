
# InfoLine Test Sistemi

## Test Quruluşu

Bu proyektdə aşağıdakı test növləri istifadə olunur:

1. **Unit Testlər**: Tək komponentin və ya funksiyanın testləri
2. **İnteqrasiya Testləri**: Bir neçə komponentin və ya servisin birlikdə testləri
3. **E2E Testləri**: İstifadəçi təcrübəsinin tam testləri (hələ tətbiq edilməyib)

## Test Alətləri

- **Vitest**: Test framework
- **React Testing Library**: React komponentlərinin testləri üçün
- **MSW (Mock Service Worker)**: API sorğularının mock edilməsi üçün
- **Faker.js**: Test məlumatlarının generasiyası üçün

## Testlərin İşlədilməsi

Testləri işlətmək üçün:

```bash
# Bütün testləri işlət
npm run test

# Konkret bir faylın testlərini işlət
npm run test -- src/tests/auth/useAuth.test.tsx

# Test coverage hesabatını əldə et
npm run test:coverage
```

## Mock Məlumat Strukturu

Test üçün istifadə olunan mock məlumatlar `src/tests/mocks/data` qovluğunda yerləşir:

- `users.ts`: İstifadəçilər üçün mock məlumatlar
- `categories.ts`: Kateqoriyalar üçün mock məlumatlar
- `schools.ts`: Məktəblər üçün mock məlumatlar
- vb.

## API Sorğuları Üçün Moclar

API sorğularını mock etmək üçün `src/tests/mocks/handlers.ts` faylı istifadə olunur. Yeni API sorğuları əlavə etdikdə, bu faylda müvafiq handler-ları əlavə etmək lazımdır.

## Test Yazma Qaydaları

### Komponent Testləri

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Başlıq')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testləri

```typescript
import { renderHook, act } from '@testing-library/react';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });

  it('updates state', () => {
    const { result } = renderHook(() => useMyHook());
    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(1);
  });
});
```

## Çətin Test Halları Üçün Strategiyalar

1. **Context və Provider-lərin testləri**: Komponent və hookların provider-lərlə birgə test edilməsi üçün custom wrapper-lər istifadə edilir.

2. **Supabase və API sorğuları**: MSW istifadə edərək API sorğuları simulyasiya edilir və Supabase çağırışları mock edilir.

3. **Authentication testləri**: Auth state və auth funksiyalarının testləri üçün mock strategiyaları tətbiq edilir.
