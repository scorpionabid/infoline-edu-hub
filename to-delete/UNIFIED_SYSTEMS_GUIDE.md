# 🚀 İnfoLine Unified Systems - Developer Guide

## 📚 Yeni API Sistemi

İnfoLine tətbiqində **Cache** və **Notification** sistemləri vahid, güclü və performanslı API-lər ilə birləşdirildi.

---

## 🗄️ Cache System

### **Əsas İmport:**
```typescript
import { cacheManager, useCache, CACHE_KEYS, CACHE_TTL } from '@/cache';
```

### **Əsas İstifadə:**

#### **1. Basic Cache Operations:**
```typescript
// Set data with auto-strategy
cacheManager.set('user_data', userData);

// Set with specific options
cacheManager.set('user_profile', profile, {
  storage: 'localStorage',
  ttl: CACHE_TTL.LONG,
  priority: true
});

// Get data (tries all storage types)
const userData = cacheManager.get('user_data');

// Get from specific storage
const profile = cacheManager.get('user_profile', 'localStorage');

// Check if exists
if (cacheManager.has('user_data')) {
  // Data exists
}

// Delete data
cacheManager.delete('user_data');

// Clear all cache
cacheManager.clear();
```

#### **2. React Hook Usage:**
```typescript
import { useCache, useCachedQuery } from '@/cache';

// Simple cache hook
const { value, set, remove, exists } = useCache('user_preferences', {
  storage: 'localStorage',
  fallback: defaultPreferences
});

// React Query integration
const { data, isLoading, error } = useCachedQuery(
  'categories',
  () => fetchCategories(),
  {
    cacheOptions: { storage: 'memory', ttl: CACHE_TTL.MEDIUM },
    queryOptions: { staleTime: 5 * 60 * 1000 }
  }
);
```

#### **3. Auto-Strategy Selection:**
```typescript
// System automatically chooses best strategy
const { adapter, options } = cacheManager.auto('large_report', reportData);

// For user data: memory + priority
// For large data: localStorage
// For reports: memory + short TTL
// For translations: localStorage + long TTL
```

#### **4. Performance Monitoring:**
```typescript
import { useCacheStats } from '@/cache';

const { getStats, getHealth, cleanup } = useCacheStats();

// Get performance metrics
const stats = getStats();
console.log(`Hit rate: ${stats.total.hitRate}%`);

// Health check
const health = getHealth();
if (!health.healthy) {
  console.log('Issues:', health.issues);
}
```

---

## 🔔 Notification System

### **Əsas İmport:**
```typescript
import { 
  useNotifications, 
  NotificationHelpers, 
  notificationManager 
} from '@/notifications';
```

### **Əsas İstifadə:**

#### **1. React Hook Usage:**
```typescript
const {
  notifications,
  unreadCount,
  isLoading,
  markAsRead,
  markAllAsRead,
  clearAll,
  createNotification
} = useNotifications(userId);

// Mark notification as read
markAsRead('notification-id');

// Create new notification
createNotification({
  userId: 'user123',
  title: 'Yeni məlumat',
  message: 'Kateqoriya yeniləndi',
  type: 'info',
  priority: 'normal'
});
```

#### **2. Notification Types:**
```typescript
// Available types
type NotificationType = 
  | 'info' | 'success' | 'warning' | 'error'
  | 'deadline' | 'approval' | 'rejection'
  | 'reminder' | 'system' | 'category_update'
  | 'data_entry' | 'school_update'
  | 'region_update' | 'sector_update';

// Available priorities
type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

// Available channels
type NotificationChannel = 'email' | 'push' | 'inApp' | 'sms' | 'system';
```

#### **3. Helper Functions:**
```typescript
import { NotificationHelpers } from '@/notifications';

// Deadline notification
await NotificationHelpers.createDeadlineNotification(
  userId,
  'Əsas Məlumatlar', // categoryName
  'cat123',         // categoryId
  '2024-12-31',     // deadlineDate
  3                 // daysRemaining
);

// Approval notification
await NotificationHelpers.createApprovalNotification(
  userId,
  'Əsas Məlumatlar',
  'cat123',
  true, // approved
  'reviewer123',
  'Məhəmməd Əliyev',
  undefined // no rejection reason
);

// Data entry reminder
await NotificationHelpers.createDataEntryReminder(
  userId,
  'Əsas Məlumatlar',
  'cat123',
  75, // completion percentage
  'Bakı şəhər məktəbi №1'
);
```

#### **4. Bulk Notifications:**
```typescript
import { useBulkNotifications } from '@/notifications';

const { sendBulkNotifications, isSending } = useBulkNotifications();

// Send to multiple users
await sendBulkNotifications({
  type: 'system',
  title: 'Sistem Yeniləməsi',
  message: 'Sistem bu gecə yenilənəcək',
  priority: 'high',
  channels: ['inApp', 'email'],
  user_ids: ['user1', 'user2', 'user3']
});
```

#### **5. Real-time Notifications:**
```typescript
// Provider component
import { UnifiedNotificationProvider } from '@/notifications';

function App() {
  return (
    <UnifiedNotificationProvider 
      userId={currentUserId}
      enableToasts={true}
      toastConfig={{
        position: 'top-right',
        duration: 5000,
        showOnlyHighPriority: false
      }}
    >
      <YourAppContent />
    </UnifiedNotificationProvider>
  );
}
```

---

## 🔄 Migration Guide

### **Cache API Migration:**

```typescript
// ❌ OLD - lib/cache.ts
import { getCache, setCache } from '@/lib/cache';
getCache('key');
setCache('key', data, expiry);

// ✅ NEW - Unified cache
import { cacheManager } from '@/cache';
cacheManager.get('key');
cacheManager.set('key', data, { ttl: expiry });

// ❌ OLD - useCachedQuery
import { useCachedQuery } from '@/hooks/common/useCachedQuery';

// ✅ NEW - Unified cache hook
import { useCachedQuery } from '@/cache';
```

### **Notification API Migration:**

```typescript
// ❌ OLD - useNotifications
import { useNotifications } from '@/hooks/useNotifications';

// ✅ NEW - Unified notifications
import { useNotifications } from '@/notifications';

// ❌ OLD - notificationService
import { createNotification } from '@/services/notificationService';
createNotification(userId, title, message, type);

// ✅ NEW - Unified manager
import { notificationManager } from '@/notifications';
notificationManager.createNotification(userId, title, message, type, options);
```

---

## 🧪 Testing

### **Cache Testing:**
```typescript
import { cacheManager, CacheDebug } from '@/cache';

// Run cache tests
CacheDebug.runTests();

// Enable verbose logging
CacheDebug.enableVerboseLogging();

// Get cache stats
const stats = cacheManager.getStats();
console.log('Cache performance:', stats);
```

### **Notification Testing:**
```typescript
import { NotificationDebug } from '@/notifications';

// Run notification tests
await NotificationDebug.runTests('test-user-id');

// Get notification stats
const stats = NotificationDebug.getStats();
console.log('Notification performance:', stats);
```

---

## 📊 Performance Features

### **Cache Features:**
- ✅ **LRU Eviction:** Memory cache automatically removes least recently used items
- ✅ **Cross-tab Sync:** Changes sync across browser tabs in real-time
- ✅ **Auto-strategy:** System chooses best storage based on data characteristics
- ✅ **TTL Management:** Automatic expiration and cleanup
- ✅ **Performance Monitoring:** Built-in metrics and health checks

### **Notification Features:**
- ✅ **Real-time Updates:** Live notifications via Supabase subscriptions
- ✅ **Smart Batching:** Efficient bulk notification processing
- ✅ **Retry Logic:** Automatic retry for failed operations
- ✅ **Toast Integration:** Built-in toast notifications with Sonner
- ✅ **Performance Tracking:** Operation timing and error rate monitoring

---

## 🛠️ Migration Helper

Köhnə API istifadəsini tapmaq üçün migration helper script istifadə edin:

```bash
# Full scan
node migration-helper.js

# Only cache issues
node migration-helper.js --cache-only

# Only notification issues  
node migration-helper.js --notif-only

# Help
node migration-helper.js --help
```

---

## 📚 Advanced Usage

### **Custom Cache Strategies:**
```typescript
// Create custom cache adapter
class CustomCacheAdapter extends BaseCacheAdapter {
  protected evict() {
    // Custom eviction logic
  }
}

// Register with manager
const customAdapter = new CustomCacheAdapter();
```

### **Custom Notification Types:**
```typescript
// Extend notification types
declare module '@/notifications' {
  interface NotificationMetadata {
    custom_field?: string;
  }
}

// Use custom metadata
await notificationManager.createNotification(
  userId,
  'Custom Notification',
  'Message',
  'info',
  {
    metadata: {
      custom_field: 'custom_value'
    }
  }
);
```

---

## 🚨 Breaking Changes

### **Deprecated APIs (will be removed in future versions):**
- `@/lib/cache` - Use `@/cache` instead
- `@/utils/cacheUtils` - Use `@/cache` instead  
- `@/contexts/NotificationContext` - Use `@/notifications` instead
- `@/hooks/useNotifications` - Use `@/notifications` instead
- `@/services/notificationService` - Use `@/notifications` instead

### **Migration Timeline:**
- **Current:** Backward compatibility maintained with deprecation warnings
- **Next Release:** Remove deprecated APIs
- **Recommended:** Migrate immediately to avoid issues

---

## 🎯 Best Practices

### **Cache:**
1. Use appropriate TTL for your data type
2. Prefer auto-strategy for most cases
3. Use priority flag for critical data
4. Monitor cache hit rates
5. Clean up expired data regularly

### **Notifications:**
1. Use appropriate notification types
2. Set meaningful priorities
3. Include relevant metadata
4. Handle real-time events properly
5. Batch operations when possible

---

## 📞 Support

Suallar və problemlər üçün:
- 📄 Migration Status: `/REFACTORING_STATUS.md`
- 🧪 Test Examples: `/src/__tests__/unified-*-system.test.ts`
- 🔧 Migration Helper: `migration-helper.js`

**Unified systems ilə daha performanslı və maintainable kod yazın! 🚀**
