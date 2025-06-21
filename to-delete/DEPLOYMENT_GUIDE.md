# 🚀 İnfoLine Production Deployment Guide

## Deployment Üçün Hazırlıq

İnfoLine sistemini production mühitinə uğurla deploy etmək üçün aşağıdakı addımları izləyin.

## 📋 1. Pre-Deployment Yoxlanış

### Script İcazələrini Verin
```bash
chmod +x build-production.sh
chmod +x pre-deployment-check.sh
```

### Sistem Yoxlanışını Başladın
```bash
./pre-deployment-check.sh
```

Bu script aşağıdakıları yoxlayacaq:
- Project strukturu
- Dependencies
- Environment konfiqurasiyası
- Build sistemi
- Code quality
- Test suite
- Təhlükəsizlik
- Translation files
- Supabase integration
- Performance metrics

## 📦 2. Production Build

### Build Script İşə Salın
```bash
./build-production.sh
```

Bu script aşağıdakıları edəcək:
- Previous build-ləri təmizləyəcək
- Dependencies yükləyəcək
- TypeScript type check
- ESLint validation
- Test suite execution
- Translation validation
- Production build yaradacaq
- Build verification
- Security checks
- Preview server başladacaq

## 🔧 3. Environment Konfiqurasiyası

### Production Environment Variables

`.env.production.template` faylını `.env.production` olaraq kopyalayın və düzgün dəyərləri təyin edin:

```bash
cp .env.production.template .env.production
```

**Mütləq yenilənməli dəyərlər:**

```env
# Supabase Production Project
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Production Domain
VITE_BASE_URL=https://infoline.edu.az

# Analytics (əgər istifadə olunacaqsa)
VITE_GA_TRACKING_ID=GA-XXXXX-X

# Error Tracking (əgər istifadə olunacaqsa)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🗄️ 4. Supabase Production Setup

### Yeni Production Project

1. **Supabase Dashboard-da yeni project yaradın**
   - Production-only environment
   - Region seçimi (Europe/US)
   - Strong password

2. **Database Schema Migration**
   ```sql
   -- Development database-dən production-a schema kopyalayın
   -- RLS policies-ləri də daxil olmaqla
   ```

3. **Edge Functions Deploy**
   ```bash
   cd supabase
   supabase login
   supabase link --project-ref your-production-ref
   supabase functions deploy
   ```

4. **Initial Data Setup**
   - SuperAdmin hesabı yaratmaq
   - Test regionları və sektorları yaratmaq
   - Sample categoriyalar yaratmaq

## 🌐 5. Hosting Platform Deploy

### Lovable Platform (Tövsiyə olunur)

1. **Lovable Dashboard**
   - Project-i açın
   - "Share" → "Publish" düyməsinə basın
   - Production environment variables təyin edin
   - Custom domain konfiqurasiyası (əgər varsa)

### Netlify Deploy (Alternativ)

```bash
# 1. Build yaradın
npm run build

# 2. Netlify CLI ilə deploy edin
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist

# 3. Environment variables Netlify dashboard-da təyin edin
```

### Vercel Deploy (Alternativ)

```bash
# 1. Build yaradın
npm run build

# 2. Vercel CLI ilə deploy edin
npm install -g vercel
vercel login
vercel --prod

# 3. Environment variables Vercel dashboard-da təyin edin
```

## ✅ 6. Post-Deployment Verification

### Functional Testing Checklist

```bash
# Manual test etməli funksiyalar:
□ Login/Logout (bütün rollar üçün)
□ SuperAdmin: Region yaratma/redaktə
□ RegionAdmin: Sektor və məktəb idarəetməsi
□ SectorAdmin: Məktəb məlumatlarının təsdiqi
□ SchoolAdmin: Məlumat daxiletməsi
□ Çoxdilli interfeys (4 dil)
□ Excel import/export
□ Notification sistemi
□ File upload funksionallığı
```

### Performance Testing

```bash
# Performance metrics yoxlamaq:
□ Page load speed < 3 saniyə
□ API response time < 500ms
□ Database query performance
□ Mobile responsiveness
□ Cross-browser compatibility
```

### Security Testing

```bash
# Təhlükəsizlik yoxlamaları:
□ Unauthorized access testləri
□ Role permission testləri
□ Input validation testləri
□ SQL injection protection
□ XSS protection
□ CSRF protection
```

## 📊 7. Monitoring Setup

### Error Tracking (Sentry)

```typescript
// src/main.tsx-da əlavə edin
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production",
    tracesSampleRate: 0.1,
  });
}
```

### Analytics (Google Analytics)

```typescript
// src/lib/analytics.ts
import { getEnv } from '@/config/environment';

if (getEnv('VITE_GA_TRACKING_ID')) {
  // GA4 setup code
}
```

## 🔄 8. Backup və Recovery Plan

### Database Backup

```bash
# Supabase automatic backup əlavəsində:
# Manual backup strategy
pg_dump -h db.xxx.supabase.co -U postgres database_name > backup.sql
```

### Code Backup

```bash
# Git repository backup
git push origin main
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

## 📞 9. Support və Maintenance

### User Documentation

- [ ] Admin guides hazırlamaq (hər rol üçün)
- [ ] FAQ dokumenti yaratmaq
- [ ] Video tutorials hazırlamaq
- [ ] Contact information təyin etmək

### Technical Documentation

- [ ] API documentation yeniləmək
- [ ] Database schema dokumenti
- [ ] Deployment guide yeniləmək
- [ ] Troubleshooting guide yaratmaq

## 🚨 10. Emergency Procedures

### Rollback Plan

```bash
# Previous version-a qayıtmaq üçün:
# 1. Git-də previous stable tag-i tap
git checkout v0.9.0

# 2. Re-deploy
./build-production.sh

# 3. Database rollback (əgər lazımsa)
psql -h db.xxx.supabase.co -U postgres -d database_name < backup_v0.9.0.sql
```

### Support Contacts

```
Technical Lead: [email]
DevOps Engineer: [email]
Database Admin: [email]
Business Owner: [email]
```

## 🎉 Go-Live Checklist

**Final sign-off əvvəl:**

- [ ] ✅ Bütün testlər keçib
- [ ] ✅ Performance benchmarks qarşılanıb
- [ ] ✅ Təhlükəsizlik audit tamamlanıb
- [ ] ✅ Backup strategiyası fəaliyyətdə
- [ ] ✅ Monitoring tools konfiqurasiya edilib
- [ ] ✅ User documentation hazırdır
- [ ] ✅ Support team hazırdır
- [ ] ✅ Emergency procedures müəyyən edilib

**Go-Live Date**: _______________

---

## 📝 Quick Commands Reference

```bash
# Pre-deployment check
./pre-deployment-check.sh

# Production build
./build-production.sh

# Environment validation
npm run validate:production

# Test suite
npm run test:all
npm run test:coverage

# Build and preview
npm run build
npm run preview

# Deployment
# (platform-specific commands)
```

## 🔗 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/build.html)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Bu guide-ı izləyərək İnfoLine sistemini uğurla production mühitinə deploy edə bilərsiniz. Hər addım diqqətlə icra edilməlidir və heç bir mərhələ atlanmamalıdır.**
