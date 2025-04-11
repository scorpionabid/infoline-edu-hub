
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
- **Faker.js**: Test məlumatlarının generasiyası üçün (əlavə edilə bilər)

## Testlərin İşlədilməsi

Testləri işlətmək üçün qlobal paketin köməyi ilə aşağıdakı əmrləri istifadə edə bilərsiniz:

```bash
# Bütün testləri işlət
npx vitest run

# Testləri izləmə rejimində işlət
npx vitest

# Test coverage hesabatını əldə et
npx vitest run --coverage

# UI interfeysi ilə testləri işlət
npx vitest --ui
```

## Test Strukturu

- `src/tests/`: Əsas test qovluğu
  - `mocks/`: Mock məlumatlar və serverlər
  - `utils/`: Test utilitləri və köməkçi funksiyalar
  - `integration/`: İnteqrasiya testləri
  - `units/`: Unit testlər
  - `hooks/`: React hook-ları üçün testlər
  - `components/`: React komponentləri üçün testlər

## Mock Məlumat Strukturu

Test üçün istifadə olunan mock məlumatlar `src/tests/mocks/data` qovluğunda yerləşir:

- `users.ts`: İstifadəçilər üçün mock məlumatlar
- `categories.ts`: Kateqoriyalar üçün mock məlumatlar
- `schools.ts`: Məktəblər üçün mock məlumatlar və s.

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
