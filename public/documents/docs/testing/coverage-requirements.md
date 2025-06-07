# İnfoLine Test Coverage Tələbləri

## 📋 Sənəd Məlumatları

**Versiya:** 1.0  
**Tarix:** 2 İyun 2025  
**Müəllif:** İnfoLine QA Team  
**Status:** Aktiv  
**Əlaqəli Sənədlər:** [Test Strategy](./test-strategy.md), [Test Plan](./test-plan.md)

## 🎯 Coverage Məqsədləri

Bu sənəd İnfoLine sisteminin test coverage tələblərini, threshold-larını və ölçü kriteriyalarını müəyyən edir.

## 📊 Ümumi Coverage Hədəfləri

### Primary Metrics (Əsas Göstəricilər)

| Metric | Target | Minimum | Current | Status |
|--------|--------|---------|---------|--------|
| **Line Coverage** | 85% | 80% | ~30% | 🔴 Below Target |
| **Branch Coverage** | 80% | 75% | ~25% | 🔴 Below Target |
| **Function Coverage** | 90% | 85% | ~35% | 🔴 Below Target |
| **Statement Coverage** | 85% | 80% | ~30% | 🔴 Below Target |

### Secondary Metrics (Əlavə Göstəricilər)

| Metric | Target | Description |
|--------|--------|-------------|
| **Uncovered Lines** | < 300 | Ümumi test edilməmiş sətir sayı |
| **Complex Function Coverage** | 95% | 10+ parameter olan funksiyalar |
| **Critical Path Coverage** | 100% | Mühüm business logic paths |
| **Error Path Coverage** | 80% | Exception və error handling |

## 🏗️ Komponent Kateqoriyaları üzrə Coverage

### Kritik Komponentlər (95%+ Coverage)
Bu komponentlər sistemin əsas funksionalığını təmin edir və maksimum test coverage tələb edir.

#### Authentication & Authorization
- **Target Coverage:** 95%
- **Components:**
  - `src/components/auth/LoginForm.tsx`
  - `src/components/auth/UserProfile.tsx`
  - `src/components/auth/RequireRole.tsx`
  - `src/hooks/auth/useAuthStore.ts`
  - `src/services/auth/AuthService.ts`

#### Data Entry System
- **Target Coverage:** 95%
- **Components:**
  - `src/components/dataEntry/DataEntryForm.tsx`
  - `src/components/dataEntry/CategoryForm.tsx`
  - `src/hooks/dataEntry/useDataEntry.ts`
  - `src/services/dataEntryService.ts`

#### Approval Workflow
- **Target Coverage:** 95%
- **Components:**
  - `src/components/approval/ApprovalManager.tsx`
  - `src/components/approval/ApprovalDialog.tsx`
  - `src/hooks/approval/useApproval.ts`

### Əhəmiyyətli Komponentlər (85%+ Coverage)
Bu komponentlər mühüm funksiyalar təmin edir.

#### Dashboard Components
- **Target Coverage:** 85%
- **Components:**
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/SuperAdminDashboard.tsx`
  - `src/components/dashboard/RegionAdminDashboard.tsx`
  - `src/components/dashboard/SectorAdminDashboard.tsx`
  - `src/components/dashboard/SchoolAdminDashboard.tsx`

#### Navigation & Layout
- **Target Coverage:** 85%
- **Components:**
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/NavigationMenu.tsx`

#### Table Components
- **Target Coverage:** 85%
- **Components:**
  - `src/components/schools/SchoolTable.tsx`
  - `src/components/users/UserTable.tsx`
  - `src/components/common/DataTable.tsx`

### Standart Komponentlər (75%+ Coverage)
Ümumi istifadə olunan komponentlər.

#### UI Components
- **Target Coverage:** 75%
- **Components:**
  - `src/components/ui/Button.tsx`
  - `src/components/ui/Input.tsx`
  - `src/components/ui/Modal.tsx`
  - `src/components/ui/Form.tsx`

#### Utility Components
- **Target Coverage:** 75%
- **Components:**
  - `src/components/common/EmptyState.tsx`
  - `src/components/common/LoadingSpinner.tsx`
  - `src/components/charts/DoughnutChart.tsx`

### Opsional Komponentlər (60%+ Coverage)
Əlavə funksiyalar və preferences.

#### Settings & Preferences
- **Target Coverage:** 60%
- **Components:**
  - `src/components/settings/ProfileSettings.tsx`
  - `src/components/settings/LanguageSelector.tsx`
  - `src/components/settings/ThemeToggle.tsx`

## 📁 Directory üzrə Coverage Requirements

### Core Business Logic
```
src/services/          → 95% coverage
src/hooks/            → 90% coverage
src/utils/            → 85% coverage
src/types/            → N/A (type definitions)
```

### Component Layers
```
src/pages/            → 85% coverage
src/components/auth/  → 95% coverage
src/components/dataEntry/ → 95% coverage
src/components/approval/  → 95% coverage
src/components/dashboard/ → 85% coverage
src/components/ui/    → 75% coverage
src/components/common/ → 75% coverage
```

### Supporting Files
```
src/context/          → 80% coverage
src/integrations/     → 90% coverage
src/api/             → 90% coverage
```

## 🚫 Coverage Exclusions

### Automated Exclusions
Bu fayllar avtomatik olaraq coverage hesablamalarından çıxarılır:

```javascript
// vite.config.ts coverage.exclude
[
  'src/**/*.d.ts',           // Type definitions
  'src/**/*.stories.{ts,tsx}', // Storybook stories
  'src/**/*.test.{ts,tsx}',   // Test files
  'src/**/*.spec.{ts,tsx}',   // Spec files
  'src/main.tsx',            // Application entry point
  'src/vite-env.d.ts',       // Vite environment types
  'src/__tests__/**',        // Test directory
  'src/__mocks__/**',        // Mock directory
]
```

### Manual Exclusions
Bu fayllar manual olaraq coverage-dan çıxarılmışdır:

- **Third-party integrations:** Üçüncü tərəf API wrapper-ları
- **Auto-generated code:** Code generation tool-ları ilə yaradılan fayllar
- **Development utilities:** Yalnız development zamanı istifadə olunan utilities
- **Legacy code:** Deprecated və ya migration gözləyən kod

### Temporary Exclusions
Bu fayllar müvəqqəti olaraq çıxarılıb və sonradan daxil ediləcək:

```typescript
// TODO: Add test coverage
/* istanbul ignore file */
```

## 📈 Coverage Progression Plan

### Phase 1: Foundation (Həftə 1-2)
**Target:** 60% overall coverage

**Priority Files:**
- Authentication core
- Basic UI components
- Utility functions

**Weekly Targets:**
- Həftə 1: 40% → 50%
- Həftə 2: 50% → 60%

### Phase 2: Core Components (Həftə 3-5)
**Target:** 80% overall coverage

**Priority Files:**
- Dashboard components
- Data entry system
- Navigation components

**Weekly Targets:**
- Həftə 3: 60% → 70%
- Həftə 4: 70% → 75%
- Həftə 5: 75% → 80%

### Phase 3: Comprehensive Coverage (Həftə 6-8)
**Target:** 85% overall coverage

**Priority Files:**
- Approval workflow
- Table components
- Service layers

**Weekly Targets:**
- Həftə 6: 80% → 82%
- Həftə 7: 82% → 84%
- Həftə 8: 84% → 85%

### Phase 4: Optimization (Həftə 9-11)
**Target:** 85%+ maintained coverage

**Focus:**
- Quality improvement
- Edge case coverage
- Performance optimization

## 🔍 Coverage Quality Metrics

### Coverage Distribution Analysis
Coverage yalnız kəmiyyət deyil, keyfiyyət də əhəmiyyətlidir.

#### Ideal Distribution
```
90-100% coverage: 30% of files (critical components)
80-89% coverage:  40% of files (important components)
70-79% coverage:  20% of files (standard components)
60-69% coverage:  10% of files (optional components)
<60% coverage:    0% of files (not acceptable)
```

#### Current Distribution Analysis
```bash
# Coverage distribution analizi üçün script
npm run test:coverage:analysis
```

### Line Coverage Quality
Sadəcə sətir sayı deyil, hansı sətirlərin test edilməsi də vacibdir.

#### High Priority Lines
- **Business logic:** Əsas funksional kod
- **Error handling:** Exception və validation
- **State changes:** Component state mutations
- **API calls:** External service interactions

#### Medium Priority Lines
- **UI rendering:** Component render logic
- **Event handlers:** User interaction handlers
- **Utility functions:** Helper və formatting functions

#### Low Priority Lines
- **Logging statements:** Console və debug outputs
- **Comments və documentation**
- **Type assertions:** TypeScript type checks

## 🛡️ Coverage Quality Gates

### Pre-commit Gates
```bash
# Minimum coverage check
"husky": {
  "hooks": {
    "pre-commit": "npm run test:coverage:check"
  }
}
```

Coverage threshold-ı aşağı düşərsə commit bloklanır.

### Pull Request Gates
PR merge etmək üçün aşağıdakı şərtlər yerinə yetirilməlidir:

- [ ] Overall coverage ≥ 85%
- [ ] New code coverage ≥ 90%
- [ ] No decrease in existing coverage
- [ ] Critical components ≥ 95%

### Release Gates
Production release üçün:

- [ ] All coverage targets met
- [ ] Coverage trend stable/improving
- [ ] No significant coverage gaps
- [ ] Quality metrics satisfied

## 📊 Coverage Reporting

### Automated Reports
Coverage reportları avtomatik yaradılır və saxlanılır.

#### Daily Reports
- Coverage trend analysis
- New coverage gaps
- Quality metric changes

#### Weekly Reports
- Progress toward targets
- Component-level analysis
- Team performance metrics

#### Monthly Reports
- Strategic coverage review
- Tool və process improvements
- Training needs assessment

### Report Formats

#### HTML Reports
```bash
npm run test:coverage:html
# Output: coverage/lcov-report/index.html
```

#### JSON Reports
```bash
npm run test:coverage:json
# Output: coverage/coverage-final.json
```

#### Text Summary
```bash
npm run test:coverage:text
# Console output summary
```

## 🔧 Coverage Tools və Configuration

### Vitest Configuration
```typescript
// vite.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 85,
          statements: 85
        },
        // Per-file thresholds
        'src/components/auth/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/components/dataEntry/**': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        }
      }
    }
  }
});
```

### Custom Coverage Scripts
```json
// package.json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:coverage:watch": "vitest --coverage",
    "test:coverage:check": "vitest run --coverage --reporter=verbose",
    "test:coverage:html": "vitest run --coverage --reporter=html",
    "test:coverage:threshold": "vitest run --coverage --reporter=threshold"
  }
}
```

## 📈 Coverage Monitoring və Alerting

### CI/CD Integration
```yaml
# .github/workflows/coverage.yml
- name: Check Coverage
  run: npm run test:coverage:check
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    fail_ci_if_error: true
    
- name: Coverage Comment
  uses: 5monkeys/cobertura-action@master
  with:
    path: coverage/cobertura-coverage.xml
    minimum_coverage: 85
```

### Coverage Alerts
Aşağıdakı hallar notification göndərir:

- Coverage 85%-dən aşağı düşərsə
- Critical component coverage 95%-dən aşağı düşərsə
- 5 ardıcıl gündə coverage azalarsa
- New PR coverage target-ə çatmırsa

## 🎯 Success Criteria

### Short-term (1 ay)
- [ ] Overall coverage ≥ 80%
- [ ] Critical components ≥ 95%
- [ ] Coverage reporting aktiv
- [ ] Quality gates functional

### Medium-term (3 ay)
- [ ] Overall coverage ≥ 85%
- [ ] All targets met
- [ ] Coverage trend stable
- [ ] Team adoption complete

### Long-term (6 ay)
- [ ] Coverage quality high
- [ ] Automated monitoring
- [ ] Continuous improvement
- [ ] Best practices established

Bu coverage tələbləri İnfoLine sisteminin yüksək keyfiyyətini təmin edəcək və inkişaf prosesində etibarlılığı artıracaq.
