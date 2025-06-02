# Test Coverage Baseline Müəyyən Etmə

## Məqsəd
Bu fayl test coverage baseline-ını müəyyən etmək və sonrakı inkişaf üçün hədəflər təyin etmək üçünü.

## Coverage Komandaları

```bash
# Basic coverage
npm run test:coverage

# UI ilə coverage
npm run test:coverage:ui

# Specific test file
npm run test:coverage -- enhanced-LanguageSelector.test.tsx

# Integration tests coverage
npm run test:integration
```

## Coverage Hədəfləri

### Cari Konfiqurasiya (vite.config.ts)
```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'src/setupTests.ts',
    'src/__tests__/',
    '**/*.d.ts',
    '**/*.config.*',
    'dist/',
    'build/'
  ],
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Prioritetlər

#### Phase 1 (İlk 2 həftə) - Mevcut Hədəf: 60%
- [ ] Core komponentlər (auth, navigation)
- [ ] Utility funksiyalar
- [ ] Basic hooks

#### Phase 2 (Növbəti 3 həftə) - Hədəf: 80%
- [ ] Dashboard komponentləri
- [ ] Data entry komponentləri
- [ ] Form komponentləri
- [ ] Business logic

#### Phase 3 (Final 2 həftə) - Hədəf: 85%+
- [ ] Integration testlər
- [ ] Edge cases
- [ ] Error handling
- [ ] Performance tests

## Coverage Analizi

### Müəyyən edilməsi lazım olan hissələr:
1. **Cari coverage faizi** - İlk dəfə run etdikdən sonra
2. **Komponont səviyyəsi coverage** - Hansı komponentlər test edilməyib
3. **Critical path coverage** - Ən vacib funksiyalar
4. **Test gaps** - Eksik test sahələri

### Coverage Kategoriyaları:
- **Critical (95%+)**: Authentication, Data Security, User Roles
- **High (90%+)**: Data Entry, Approval Workflow, Navigation  
- **Medium (85%+)**: Dashboard, Reports, UI Components
- **Low (80%+)**: Utilities, Helpers, Static components

## Next Steps

1. `npm install` - Coverage dependency quraşdırmaq
2. `npm run test:coverage` - İlk coverage baseline
3. Coverage report analiz etmək
4. Gap-ləri müəyyən etmək
5. Test plan update etmək

## Coverage Report Lokasiyası
Coverage report `coverage/` qovluğunda HTML formatında yaradılacaq.
