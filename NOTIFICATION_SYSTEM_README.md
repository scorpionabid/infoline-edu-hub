# İnfoLine Enhanced Notification System

Bu sənəd İnfoLine sistemi üçün yenilənmiş bildiriş sisteminin tam documentation-ıdır.

## 📋 Məzmun

1. [Giriş](#giriş)
2. [Arxitektura](#arxitektura)
3. [Xüsusiyyətlər](#xüsusiyyətlər)
4. [Quraşdırma](#quraşdırma)
5. [İstifadə](#istifadə)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## 🎯 Giriş

İnfoLine Enhanced Notification System, məktəb məlumatları toplama sistemi üçün hazırlanmış qabaqcıl bildiriş sistemidir. Bu sistem:

- **Real-time bildirişlər** - WebSocket əsaslı canlı yeniləmələr
- **Email inteqrasiyası** - Avtomatik email bildirişləri
- **Template sistemi** - Fərdiləşdirilmiş bildiriş şablonları
- **Deadline idarəetməsi** - Avtomatik son tarix xəbərdarlıqları
- **Analytics** - Bildiriş statistikaları və performans analizi
- **Preferences** - İstifadəçi tənzimləmələri və filtrlər

## 🏗️ Arxitektura

### Frontend Komponentlər

```
src/
├── components/notifications/
│   ├── EnhancedNotificationSystem.tsx     # Əsas bildiriş sistemi
│   ├── EnhancedNotificationItem.tsx       # Bildiriş elementi
│   ├── NotificationConnectionStatus.tsx   # Bağlantı statusu
│   ├── NotificationAnalytics.tsx          # Analytics paneli
│   └── NotificationSettings.tsx           # Tənzimləmələr
├── context/
│   └── EnhancedNotificationContext.tsx    # React Context
├── hooks/notifications/
│   └── useEnhancedNotifications.ts        # Custom hooks
└── services/notifications/
    ├── enhancedNotificationService.ts     # Ana xidmət
    ├── realtimeService.ts                 # Real-time bağlantı
    ├── templates/
    │   └── templateService.ts             # Template idarəetməsi
    └── scheduler/
        └── deadlineScheduler.ts           # Deadline idarəetməsi
```

### Backend Komponentlər

```
supabase/
├── functions/
│   ├── send-notification-email/          # Email göndərmə
│   ├── send-template-email/              # Template email
│   └── deadline-checker/                 # Deadline yoxlayıcısı
└── migrations/
    └── database-enhancements.sql         # DB schema
```

### Database Schema

```sql
-- Əsas cədvəllər
notifications                    # Bildirişlər
notification_templates          # Bildiriş şablonları  
user_notification_preferences  # İstifadəçi tənzimləmələri
notification_delivery_log      # Çatdırılma jurnal
scheduled_notifications        # Planlaşdırılmış bildirişlər
```

## ⭐ Xüsusiyyətlər

### 1. Real-time Bildirişlər

WebSocket əsaslı canlı bildirişlər:

```typescript
// Auto-reconnection ilə real-time bağlantı
const subscription = RealtimeNotificationService.setupRealtimeNotifications(
  userId,
  onNotificationUpdate,
  onConnectionStatusChange
);
```

### 2. Email İnteqrasiyası

Avtomatik email bildirişləri:

```typescript
// Email göndərmə
await EmailService.sendEmail({
  to: ['user@example.com'],
  subject: 'Notification Title',
  htmlContent: '<h1>Hello</h1>',
  textContent: 'Hello'
});
```

### 3. Template Sistemi

Fərdiləşdirilmiş bildiriş şablonları:

```typescript
// Template istifadəsi
await EnhancedNotificationService.createFromTemplate(
  'deadline_warning_3_days',
  {
    category_name: 'Test Category',
    deadline_date: '31.12.2024'
  },
  ['user1', 'user2']
);
```

### 4. Deadline İdarəetməsi

Avtomatik son tarix xəbərdarlıqları:

```typescript
// Deadline yoxlama job-u işə salma
const result = await DeadlineSchedulerService.runDeadlineCheckJob();
```

### 5. Analytics və Statistika

Bildiriş performans analizi:

```typescript
// Analytics məlumatları
const analytics = await EnhancedNotificationService.getNotificationAnalytics(
  userId,
  startDate,
  endDate
);
```

## 🔧 Quraşdırma

### 1. Dependencies

```bash
# Frontend dependencies (package.json-da mövcuddur)
npm install @supabase/supabase-js
npm install lucide-react
npm install date-fns
```

### 2. Database Setup

```sql
-- Database enhancements script işə salın
psql -f database-enhancements.sql
```

### 3. Environment Variables

```env
# Email service konfiqurasiyası
EMAIL_SERVICE_URL=https://api.resend.com/emails
EMAIL_SERVICE_API_KEY=your_resend_api_key
EMAIL_SERVICE_FROM_EMAIL=noreply@infoline.edu.az
FRONTEND_URL=https://infoline.edu.az
```

### 4. Edge Functions Deployment

```bash
# Supabase CLI ilə functions deploy edin
supabase functions deploy send-notification-email
supabase functions deploy send-template-email  
supabase functions deploy deadline-checker
```

## 📖 İstifadə

### 1. Context Provider Setup

```tsx
// App.tsx-da provider əlavə edin
import { EnhancedNotificationProvider } from '@/context/EnhancedNotificationContext';

function App() {
  return (
    <EnhancedNotificationProvider>
      {/* App content */}
    </EnhancedNotificationProvider>
  );
}
```

### 2. Notification System Component

```tsx
// Layout-da notification system əlavə edin
import EnhancedNotificationSystem from '@/components/notifications/EnhancedNotificationSystem';

function Layout() {
  return (
    <div>
      <header>
        <EnhancedNotificationSystem />
      </header>
    </div>
  );
}
```

### 3. Hook İstifadəsi

```tsx
// Komponentlərdə hook istifadə edin
import { useEnhancedNotifications } from '@/context/EnhancedNotificationContext';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    addNotification 
  } = useEnhancedNotifications();

  const handleAction = async () => {
    await addNotification({
      title: 'Yeni bildiriş',
      message: 'Bu test bildirişidir',
      type: 'info',
      priority: 'normal'
    });
  };

  return (
    <div>
      <p>Oxunmamış: {unreadCount}</p>
      <button onClick={handleAction}>Bildiriş əlavə et</button>
    </div>
  );
}
```

### 4. Admin Funksiyaları

```tsx
// Admin panelində deadline yoxlama
import { useEnhancedDeadlineNotifications } from '@/hooks/notifications/useEnhancedNotifications';

function AdminPanel() {
  const { runDeadlineCheckJob, statistics } = useEnhancedDeadlineNotifications();

  const handleCheckDeadlines = async () => {
    const result = await runDeadlineCheckJob();
    console.log('Deadline check result:', result);
  };

  return (
    <div>
      <button onClick={handleCheckDeadlines}>
        Deadline-ları yoxla
      </button>
      {statistics && (
        <div>
          <p>3 gün qalan: {statistics.upcoming3Days}</p>
          <p>1 gün qalan: {statistics.upcoming1Day}</p>
          <p>Bitmiş: {statistics.expired}</p>
        </div>
      )}
    </div>
  );
}
```

## 📚 API Reference

### EnhancedNotificationService

```typescript
class EnhancedNotificationService {
  // Bildiriş yaratma
  static async createNotification(params: CreateNotificationParams): Promise<NotificationResult>
  
  // Toplu bildiriş yaratma
  static async createBulkNotifications(notifications: BulkNotificationParams[]): Promise<BulkResult>
  
  // Template-dən bildiriş yaratma
  static async createFromTemplate(templateId: string, data: TemplateData, userIds: string[]): Promise<NotificationResult>
  
  // Bildirişi oxunmuş kimi qeyd etmə
  static async markAsRead(notificationId: string, userId: string): Promise<NotificationResult>
  
  // Hamısını oxunmuş kimi qeyd etmə
  static async markAllAsRead(userId: string): Promise<NotificationResult>
  
  // Bildiriş silmə
  static async deleteNotification(notificationId: string, userId: string): Promise<NotificationResult>
  
  // İstifadəçi tənzimləmələri
  static async getUserPreferences(userId: string): Promise<any>
  static async updateUserPreferences(userId: string, preferences: any): Promise<any>
  
  // Analytics
  static async getNotificationAnalytics(userId?: string, startDate?: Date, endDate?: Date): Promise<any>
}
```

### DeadlineSchedulerService

```typescript
class DeadlineSchedulerService {
  // Deadline yoxlama
  static async checkUpcomingDeadlines(): Promise<DeadlineCheckResult>
  
  // Deadline notification planlaşdırma
  static async scheduleDeadlineNotifications(categoryId: string): Promise<void>
  
  // Deadline job işə salma
  static async runDeadlineCheckJob(): Promise<JobResult>
  
  // Deadline statistikası
  static async getDeadlineStatistics(): Promise<any>
}
```

### EmailService

```typescript
class EmailService {
  // Email göndərmə
  static async sendEmail(params: EmailParams): Promise<EmailResult>
  
  // Template email göndərmə
  static async sendTemplateEmail(templateId: string, data: EmailTemplateData, recipients: string[]): Promise<EmailResult>
  
  // Toplu email göndərmə
  static async sendBulkEmails(emails: BulkEmailParams[]): Promise<BulkEmailResult>
  
  // Email tənzimləmələri
  static async getEmailPreferences(userId: string): Promise<EmailPreferences>
  static async updateEmailPreferences(userId: string, preferences: Partial<EmailPreferences>): Promise<void>
}
```

## 🧪 Testing

### Unit Tests

```bash
# Test işə salma
npm run test

# Test coverage
npm run test:coverage
```

### Manual Testing

1. **Bildiriş yaratma testi**:
```typescript
// Test notification yaradın
await addNotification({
  title: 'Test bildirişi',
  message: 'Bu test üçündür',
  type: 'info'
});
```

2. **Real-time test**:
- Bir brauzerdə bildiriş yaradın
- Digər brauzerdə real-time yeniləməni yoxlayın

3. **Email test**:
```typescript
// Email test göndərin
await EmailService.sendEmail({
  to: ['test@example.com'],
  subject: 'Test Email',
  htmlContent: '<h1>Test</h1>'
});
```

## 🚀 Deployment

### 1. Production Build

```bash
# Frontend build
npm run build

# Edge functions deploy
supabase functions deploy
```

### 2. Database Migration

```bash
# Production DB-də migration
supabase db push
```

### 3. Cron Jobs

```bash
# Deadline checker üçün cron job
# Hər saat işləsin
0 * * * * curl -X POST https://your-project.supabase.co/functions/v1/deadline-checker
```

### 4. Monitoring Setup

```bash
# Supabase logs izləmə
supabase functions logs --follow
```

## 🔍 Troubleshooting

### Ümumi Problemlər

1. **Real-time bağlantı problemi**:
```typescript
// Connection status yoxlayın
const { connectionStatus, reconnect } = useNotificationConnection();

if (!connectionStatus.isConnected) {
  await reconnect();
}
```

2. **Email göndərilmədi**:
- Environment variables yoxlayın
- Email service API key doğrulayın
- Delivery logs yoxlayın

3. **Deadline notifications işləmir**:
- Cron job işlədiyini yoxlayın
- Template-lərin mövcud olduğunu yoxlayın
- Database trigger-ləri yoxlayın

4. **Performance problemi**:
```sql
-- Slow query-ləri tap
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- İndeks əlavə et
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at);
```

### Debug Mode

```typescript
// Debug mode aktivləşdirin
localStorage.setItem('infoline_debug', 'true');

// Console-da əlavə loglar görünəcək
```

### Monitoring Queries

```sql
-- Notification stats
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_read = false) as unread,
  AVG(CASE WHEN is_read THEN 1 ELSE 0 END) * 100 as read_rate
FROM notifications 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- Email delivery stats
SELECT 
  delivery_method,
  status,
  COUNT(*) as count
FROM notification_delivery_log 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY delivery_method, status;
```

## 📞 Dəstək

Problemlər və ya suallar üçün:

1. **GitHub Issues** - Bug report və feature request
2. **Documentation** - Bu README və code comments
3. **Team Chat** - Daxili team kommunikasiyası

## 📝 Version History

### v1.0.0 (2025-06-02)
- ✅ Enhanced notification system
- ✅ Real-time updates with reconnection
- ✅ Email integration with templates
- ✅ Deadline management automation
- ✅ Analytics and user preferences
- ✅ Mobile-responsive UI
- ✅ Comprehensive testing
- ✅ Production-ready deployment

### Planlaşdırılan Features (v1.1.0)
- 🔄 Push notifications
- 🔄 Mobile app integration
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language email templates
- 🔄 Webhook integrations

---

**Created by**: İnfoLine Development Team  
**Last Updated**: 2025-06-02  
**Version**: 1.0.0
