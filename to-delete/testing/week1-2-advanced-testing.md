# İnfoLine Advanced Testing Infrastructure (Faza 2: Week 1-2)

## Week 1: Integration Testing & E2E Framework

### Day 6-8: MSW Integration & API Testing

#### **MSW (Mock Service Worker) Complete Setup**
```typescript
// File: src/__tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: '1', email: 'test@example.com', role: 'superadmin' },
        token: 'mock-jwt-token'
      })
    );
  }),

  // Data entries endpoints
  rest.get('/data-entries', (req, res, ctx) => {
    const status = req.url.searchParams.get('status');
    return res(
      ctx.status(200),
      ctx.json({
        data: mockDataEntries.filter(entry => 
          status ? entry.status === status : true
        )
      })
    );
  }),

  // Approval endpoints
  rest.post('/data-entries/:id/approve', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Item approved' })
    );
  }),

  // Schools, regions, sectors endpoints
  rest.get('/schools', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockSchools }));
  }),

  // Error simulation endpoints
  rest.get('/error-simulation', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
  })
];
```

#### **Integration Test Scenarios**
```typescript
// File: src/__tests__/integration/auth-flow.test.tsx
describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    setupMSW();
  });

  it('completes full login workflow', async () => {
    const user = userEvent.setup();
    
    render(<App />);
    
    // Navigate to login
    expect(screen.getByText(/giriş/i)).toBeInTheDocument();
    
    // Fill login form
    await user.type(screen.getByPlaceholderText('Email'), 'admin@example.com');
    await user.type(screen.getByPlaceholderText('Şifrə'), 'password123');
    await user.click(screen.getByRole('button', { name: /giriş et/i }));
    
    // Verify redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // Verify user menu shows logged-in state
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('handles role-based dashboard content', async () => {
    // Test different roles see different content
    await loginAsRole('superadmin');
    expect(screen.getByText(/bütün regionlar/i)).toBeInTheDocument();
    
    await loginAsRole('schooladmin');
    expect(screen.queryByText(/bütün regionlar/i)).not.toBeInTheDocument();
    expect(screen.getByText(/məktəb məlumatları/i)).toBeInTheDocument();
  });
});
```

#### **Data Flow Integration Tests**
```typescript
// File: src/__tests__/integration/data-entry-approval.test.tsx
describe('Data Entry to Approval Workflow', () => {
  it('completes full data entry and approval cycle', async () => {
    const user = userEvent.setup();
    
    // Login as school admin
    await loginAsRole('schooladmin');
    
    // Navigate to data entry
    await user.click(screen.getByText(/məlumat daxil et/i));
    
    // Fill data entry form
    await user.type(screen.getByLabelText(/şagird sayı/i), '500');
    await user.type(screen.getByLabelText(/müəllim sayı/i), '30');
    
    // Submit for approval
    await user.click(screen.getByRole('button', { name: /təsdiq üçün göndər/i }));
    
    // Verify submission success
    await waitFor(() => {
      expect(screen.getByText(/uğurla göndərildi/i)).toBeInTheDocument();
    });
    
    // Switch to sector admin role
    await loginAsRole('sectoradmin');
    
    // Navigate to approval page
    await user.click(screen.getByText(/təsdiqlər/i));
    
    // Verify data appears in pending approvals
    expect(screen.getByText('500')).toBeInTheDocument(); // Student count
    expect(screen.getByText('30')).toBeInTheDocument();  // Teacher count
    
    // Approve the data
    await user.click(screen.getByRole('button', { name: /təsdiqlə/i }));
    
    // Verify approval success
    await waitFor(() => {
      expect(screen.getByText(/təsdiqləndi/i)).toBeInTheDocument();
    });
  });
});
```

### Day 9-10: E2E Testing Framework (Playwright)

#### **Playwright Setup & Configuration**
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Initialize Playwright config
npx playwright install
```

```typescript
// File: playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### **Critical E2E Test Scenarios**
```typescript
// File: e2e/auth-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  test('complete login and dashboard access', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Verify login form is visible
    await expect(page.getByText('Giriş')).toBeVisible();
    
    // Fill login credentials
    await page.fill('[placeholder="Email"]', 'superadmin@infoline.az');
    await page.fill('[placeholder="Şifrə"]', 'password123');
    
    // Submit login
    await page.click('button:has-text("Giriş et")');
    
    // Verify successful login and dashboard load
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Verify user menu shows correct user
    await expect(page.getByText('superadmin@infoline.az')).toBeVisible();
  });

  test('role-based access control', async ({ page }) => {
    // Test SuperAdmin access
    await loginAs(page, 'superadmin');
    await expect(page.getByText('Regionlar')).toBeVisible();
    await expect(page.getByText('İstifadəçilər')).toBeVisible();
    
    // Test SchoolAdmin limited access
    await loginAs(page, 'schooladmin');
    await expect(page.getByText('Regionlar')).not.toBeVisible();
    await expect(page.getByText('Məktəb Məlumatları')).toBeVisible();
  });
});
```

```typescript
// File: e2e/data-workflow.spec.ts
test.describe('Data Entry and Approval Workflow', () => {
  test('complete data entry workflow', async ({ page }) => {
    // Login as school admin
    await loginAs(page, 'schooladmin');
    
    // Navigate to data entry
    await page.click('text=Məlumat Daxil Et');
    
    // Fill data entry form
    await page.fill('[data-testid="student-count"]', '500');
    await page.fill('[data-testid="teacher-count"]', '30');
    await page.selectOption('[data-testid="school-type"]', 'tam-orta');
    
    // Submit data
    await page.click('button:has-text("Yadda Saxla")');
    
    // Verify success message
    await expect(page.getByText('Məlumatlar yadda saxlanıldı')).toBeVisible();
    
    // Submit for approval
    await page.click('button:has-text("Təsdiq Üçün Göndər")');
    
    // Verify submission
    await expect(page.getByText('Təsdiq üçün göndərildi')).toBeVisible();
  });

  test('approval workflow', async ({ page, context }) => {
    // Create new page for sector admin
    const sectorAdminPage = await context.newPage();
    
    // Login as sector admin
    await loginAs(sectorAdminPage, 'sectoradmin');
    
    // Navigate to approvals
    await sectorAdminPage.click('text=Təsdiqlər');
    
    // Verify pending approval appears
    await expect(sectorAdminPage.getByText('Gözləyən Təsdiqlər')).toBeVisible();
    
    // Approve data
    await sectorAdminPage.click('button:has-text("Təsdiqlə")');
    
    // Verify approval success
    await expect(sectorAdminPage.getByText('Təsdiqləndi')).toBeVisible();
  });
});
```

### Day 11-12: Performance & Visual Testing

#### **Performance Testing Setup**
```typescript
// File: src/__tests__/performance/render-performance.test.tsx
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';

describe('Component Render Performance', () => {
  it('dashboard renders within performance budget', () => {
    const start = performance.now();
    
    render(<Dashboard />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Dashboard should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('data table renders large datasets efficiently', () => {
    const largeDataset = generateMockData(1000); // 1000 rows
    
    const start = performance.now();
    render(<DataTable data={largeDataset} />);
    const end = performance.now();
    
    // Large dataset should render in less than 200ms
    expect(end - start).toBeLessThan(200);
  });
});
```

#### **Visual Regression Testing**
```typescript
// File: e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('dashboard visual consistency', async ({ page }) => {
    await loginAs(page, 'superadmin');
    await page.goto('/dashboard');
    
    // Wait for all components to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-superadmin.png');
  });

  test('data entry form visual consistency', async ({ page }) => {
    await loginAs(page, 'schooladmin');
    await page.goto('/data-entry');
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('data-entry-form.png');
  });

  test('approval page visual consistency', async ({ page }) => {
    await loginAs(page, 'sectoradmin');
    await page.goto('/approvals');
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('approvals-page.png');
  });
});
```

## Week 2: Accessibility & Quality Assurance

### Day 13-15: Accessibility Testing Implementation

#### **jest-axe Integration**
```typescript
// File: src/__tests__/accessibility/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Compliance', () => {
  it('login form has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('data entry form supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<DataEntryForm />);
    
    // Tab through form fields
    await user.tab();
    expect(screen.getByLabelText(/şagird sayı/i)).toHaveFocus();
    
    await user.tab();
    expect(screen.getByLabelText(/müəllim sayı/i)).toHaveFocus();
  });
});
```

#### **Screen Reader Testing**
```typescript
// File: e2e/accessibility-e2e.spec.ts
test.describe('Screen Reader Accessibility', () => {
  test('form labels are properly associated', async ({ page }) => {
    await page.goto('/data-entry');
    
    // Verify form labels
    const studentCountInput = page.getByRole('textbox', { name: /şagird sayı/i });
    await expect(studentCountInput).toBeVisible();
    
    const teacherCountInput = page.getByRole('textbox', { name: /müəllim sayı/i });
    await expect(teacherCountInput).toBeVisible();
  });

  test('navigation landmarks are properly defined', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify navigation landmarks
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
  });
});
```

### Day 16-17: Quality Assurance & Test Optimization

#### **Test Suite Optimization**
```typescript
// File: vitest.config.ts optimization
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/**/*.test.{js,ts,tsx}',
        'src/**/*.spec.{js,ts,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    // Optimize test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true
      }
    }
  }
});
```

#### **Flaky Test Detection & Prevention**
```typescript
// File: src/__tests__/utils/flaky-test-detector.ts
export const detectFlakyTest = (testName: string, runs: number = 10) => {
  const results: boolean[] = [];
  
  for (let i = 0; i < runs; i++) {
    try {
      // Run test
      const result = runTest(testName);
      results.push(result);
    } catch (error) {
      results.push(false);
    }
  }
  
  const successRate = results.filter(r => r).length / runs;
  
  if (successRate < 0.9) {
    console.warn(`⚠️  Flaky test detected: ${testName} (${successRate * 100}% success rate)`);
  }
  
  return successRate;
};
```

## Faza 2 Success Metrics

### Week 1 Targets
- [ ] MSW integration complete and working
- [ ] 15+ integration tests implemented
- [ ] Playwright E2E framework operational
- [ ] 10+ critical E2E scenarios covered
- [ ] Performance benchmarks established

### Week 2 Targets
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Visual regression testing operational
- [ ] Test suite optimized (execution time <3 min)
- [ ] Flaky test detection implemented
- [ ] Coverage threshold: 85%+

### Quality Gates
- [ ] All existing tests remain passing
- [ ] Integration tests cover critical workflows
- [ ] E2E tests validate complete user journeys
- [ ] Accessibility violations: 0
- [ ] Performance budgets met
- [ ] Test execution time acceptable

## Risk Mitigation
- **Flaky E2E Tests:** Use wait strategies, stable selectors
- **Performance Issues:** Optimize test data, parallel execution
- **Coverage Gaps:** Prioritize business-critical paths
- **Accessibility Violations:** Regular audits, team training
