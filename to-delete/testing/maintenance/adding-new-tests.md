# Yeni Test Əlavə Etmə Guide - Enhanced Version

## Məqsəd

Bu guide İnfoLine proyektində yeni testlərin necə əlavə edileceğini, enhanced test utilities istifadə edərək göstərir.

## 🚀 Sürətli Başlanğıc

### 1. Enhanced Test Utils istifadə edərək sadə komponent testi

```typescript
import { renderWithProviders, screen, userEvent, cleanupMocks } from '../enhanced-test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    cleanupMocks(); // Hər test öncəsi təmizlik
  });

  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 2. User interaction testi

```typescript
it('handles user click', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyComponent />);
  
  const button = screen.getByRole('button');
  await user.click(button);
  
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

## 📋 Test Strukturu

### Recommended Test File Structure

```typescript
/**
 * Component Enhanced Test Suite
 * 
 * Bu test suite aşağıdakı sahələri əhatə edir:
 * 1. Component rendering
 * 2. User interactions  
 * 3. Accessibility compliance
 * 4. Error handling
 * 5. Integration scenarios
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderWithProviders,
  screen,
  fireEvent,
  waitFor,
  userEvent,
  cleanupMocks,
  testComponentAccessibility,
  assertComponentRenders,
  createTestUser
} from '../enhanced-test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent Enhanced Tests', () => {
  beforeEach(() => {
    cleanupMocks();
  });

  describe('Component Rendering', () => {
    // Rendering testləri
  });

  describe('User Interactions', () => {
    // Interaction testləri
  });

  describe('Accessibility', () => {
    // A11y testləri
  });

  describe('Error Handling', () => {
    // Error scenario testləri  
  });

  describe('Integration Tests', () => {
    // Integration testləri
  });
});
```

## 🎨 Test Növləri və Patterns

### 1. Basic Component Rendering Test

```typescript
describe('Component Rendering', () => {
  it('renders with default props', () => {
    renderWithProviders(<MyComponent />);
    
    assertComponentRenders(screen.getByTestId('my-component'));
  });

  it('renders with custom props', () => {
    const props = { title: 'Custom Title', variant: 'primary' };
    renderWithProviders(<MyComponent {...props} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});
```

### 2. User Interaction Tests

```typescript
describe('User Interactions', () => {
  it('handles button click', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    renderWithProviders(<MyComponent onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Form submitted')).toBeInTheDocument();
    });
  });
});
```

### 3. State Management Tests

```typescript
describe('State Management', () => {
  it('updates state correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyStatefulComponent />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    
    // Initial state
    expect(screen.getByText('Off')).toBeInTheDocument();
    
    // Toggle state
    await user.click(toggleButton);
    expect(screen.getByText('On')).toBeInTheDocument();
  });
});
```

### 4. API Integration Tests

```typescript
describe('API Integration', () => {
  it('loads data from API', async () => {
    // Mock API response
    const mockData = [{ id: 1, name: 'Test Item' }];
    ApiMockHelper.mockSupabaseQueries();
    
    renderWithProviders(<MyDataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    const mockError = new Error('API Error');
    vi.mocked(fetch).mockRejectedValueOnce(mockError);
    
    renderWithProviders(<MyDataComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });
});
```

### 5. Accessibility Tests

```typescript
describe('Accessibility', () => {
  it('meets WCAG 2.1 AA standards', async () => {
    const { container } = renderWithProviders(<MyComponent />);
    
    await testComponentAccessibility(container);
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyNavigableComponent />);
    
    const firstButton = screen.getByRole('button', { name: /first/i });
    const secondButton = screen.getByRole('button', { name: /second/i });
    
    firstButton.focus();
    expect(firstButton).toHaveFocus();
    
    await user.keyboard('{Tab}');
    expect(secondButton).toHaveFocus();
  });

  it('has proper ARIA attributes', () => {
    renderWithProviders(<MyComponent />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-describedby');
  });
});
```

## 🔧 Mock Strategies

### 1. Component Props Mocking

```typescript
const mockProps = {
  onSave: vi.fn(),
  onCancel: vi.fn(),
  isLoading: false,
  data: createTestData()
};

renderWithProviders(<MyComponent {...mockProps} />);
```

### 2. API Mocking

```typescript
beforeEach(() => {
  // Mock all Supabase operations
  ApiMockHelper.mockSupabaseQueries();
  ApiMockHelper.mockEdgeFunctions();
});
```

### 3. Router Mocking

```typescript
it('navigates correctly', () => {
  const mockNavigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  
  renderWithProviders(<MyComponent />, { 
    initialRoute: '/test-route' 
  });
  
  const button = screen.getByRole('button', { name: /go to dashboard/i });
  fireEvent.click(button);
  
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
});
```

### 4. User Role Mocking

```typescript
it('renders admin controls for admin users', () => {
  const adminUser = createTestUser({ role: 'superadmin' });
  
  renderWithProviders(<MyComponent />, { user: adminUser });
  
  expect(screen.getByRole('button', { name: /admin action/i })).toBeInTheDocument();
});

it('hides admin controls for regular users', () => {
  const regularUser = createTestUser({ role: 'schooladmin' });
  
  renderWithProviders(<MyComponent />, { user: regularUser });
  
  expect(screen.queryByRole('button', { name: /admin action/i })).not.toBeInTheDocument();
});
```

## 🎯 Test Data Management

### 1. Test Data Factories istifadəsi

```typescript
const testUser = createTestUser({
  role: 'regionadmin',
  region_id: 'test-region-123'
});

const testRegion = createTestRegion({
  name: 'Bakı Regional',
  status: 'active'
});

const testSchool = createTestSchool({
  name: 'Test Məktəbi',
  region_id: testRegion.id,
  completion_rate: 85
});
```

### 2. Complex Test Scenarios

```typescript
describe('Complex User Journey', () => {
  it('completes full data entry workflow', async () => {
    const user = userEvent.setup();
    const schoolAdmin = createTestUser({ role: 'schooladmin' });
    
    renderWithProviders(<DataEntryWorkflow />, { 
      user: schoolAdmin,
      initialRoute: '/data-entry' 
    });
    
    // Step 1: Select category
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByText('Ümumi Məlumatlar'));
    
    // Step 2: Fill form
    const schoolNameInput = screen.getByLabelText(/məktəb adı/i);
    await user.type(schoolNameInput, 'Test Məktəbi');
    
    const studentCountInput = screen.getByLabelText(/şagird sayı/i);
    await user.type(studentCountInput, '150');
    
    // Step 3: Submit
    const submitButton = screen.getByRole('button', { name: /təsdiq üçün göndər/i });
    await user.click(submitButton);
    
    // Step 4: Verify success
    await waitFor(() => {
      expect(screen.getByText(/uğurla göndərildi/i)).toBeInTheDocument();
    });
  });
});
```

## 📊 Performance Testing

### 1. Render Performance

```typescript
describe('Performance', () => {
  it('renders within acceptable time', () => {
    const startTime = performance.now();
    
    renderWithProviders(<MyHeavyComponent />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });

  it('handles large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ 
      id: i, 
      name: `Item ${i}` 
    }));
    
    renderWithProviders(<MyDataTable data={largeDataset} />);
    
    // Should render without freezing
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
```

## 🚨 Error Boundary Testing

```typescript
describe('Error Handling', () => {
  it('catches and displays errors gracefully', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Test error');
    };
    
    renderWithProviders(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

## 📱 Responsive Testing

```typescript
describe('Responsive Design', () => {
  it('adapts to mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    renderWithProviders(<MyResponsiveComponent />);
    
    // Mobile-specific elements should be visible
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-nav')).not.toBeInTheDocument();
  });

  it('adapts to desktop viewport', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    
    renderWithProviders(<MyResponsiveComponent />);
    
    // Desktop-specific elements should be visible
    expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });
});
```

## 🔄 Test Maintenance Best Practices

### 1. DRY Principle

```typescript
// Create helper functions for common patterns
const renderMyComponentWithUser = (userRole: UserRole) => {
  const user = createTestUser({ role: userRole });
  return renderWithProviders(<MyComponent />, { user });
};

// Use in multiple tests
it('shows admin features for admin', () => {
  renderMyComponentWithUser('superadmin');
  expect(screen.getByText('Admin Panel')).toBeInTheDocument();
});
```

### 2. Clear Test Descriptions

```typescript
// Good - describes what is being tested
it('displays error message when API request fails')

// Bad - unclear what is being tested  
it('tests error handling')
```

### 3. Isolated Tests

```typescript
// Each test should be independent
beforeEach(() => {
  cleanupMocks(); // Reset all mocks
  vi.clearAllTimers(); // Clear timers
});
```

## 📝 Test Documentation

### Test file başında dokumentasiya

```typescript
/**
 * MyComponent Test Suite
 * 
 * Bu test suite aşağıdakı sahələri əhatə edir:
 * 
 * 1. **Rendering Tests**: Komponentin düzgün render olunması
 * 2. **Interaction Tests**: İstifadəçi qarşılıqlı əlaqələri
 * 3. **State Tests**: State dəyişiklikləri və side effects
 * 4. **Accessibility Tests**: WCAG 2.1 AA compliance
 * 5. **Integration Tests**: Digər komponentlərlə inteqrasiya
 * 6. **Error Tests**: Xəta hallarının idarə edilməsi
 * 
 * @component MyComponent
 * @test-coverage 95%
 * @last-updated 2025-06-02
 */
```

## 🎯 Coverage Targets

### Component Type Coverage Requirements

- **Critical Components (Auth, Navigation)**: 95%+
- **Business Logic Components**: 90%+
- **UI Components**: 85%+
- **Utility Components**: 80%+

### Test Type Distribution

- **Unit Tests**: 70%
- **Integration Tests**: 20%
- **E2E Tests**: 10%

## 🛠️ Debugging Test Failures

### 1. Debug Test Environment

```typescript
it.only('debug failing test', () => {
  renderWithProviders(<MyComponent />);
  
  // Use screen.debug() to see current DOM
  screen.debug();
  
  // Or debug specific element
  const button = screen.getByRole('button');
  screen.debug(button);
});
```

### 2. Async Debugging

```typescript
it('debugs async operations', async () => {
  renderWithProviders(<MyAsyncComponent />);
  
  // Add longer timeout for debugging
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  }, { timeout: 5000 });
});
```

## 📚 Additional Resources

- [Enhanced Test Utils Documentation](../enhanced-test-utils.tsx)
- [Coverage Requirements](../coverage-requirements.md)
- [Accessibility Testing Guide](../accessibility-requirements.md)
- [Performance Benchmarks](../performance-benchmarks.md)

## 🤝 Contributing

Yeni test patterns və ya improvements əlavə edərkən:

1. Bu guide-ı yeniləyin
2. Nümunə kod əlavə edin
3. Test coverage məqsədlərini update edin
4. Team üzvlərinə məlumat verin
