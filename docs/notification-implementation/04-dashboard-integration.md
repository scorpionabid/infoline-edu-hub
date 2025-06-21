# Step 4: Dashboard Real-time Integration (Continued)

### 3. Enhanced Notification List Component (Continued)

```typescript
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Search, 
  Filter,
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Mail,
  Trash2,
  MarkAsUnread
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { useNotifications } from '@/notifications';
import { useAuth } from '@/lib/auth';
import type { UnifiedNotification, NotificationType, NotificationPriority } from '@/notifications/core/types';

const NotificationList: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications(user?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  // Filter and sort notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filterPriority);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [notifications, searchTerm, filterType, filterPriority, sortBy]);

  // Group notifications by type
  const notificationsByType = useMemo(() => {
    const groups: Record<string, UnifiedNotification[]> = {};
    
    notifications.forEach(notification => {
      if (!groups[notification.type]) {
        groups[notification.type] = [];
      }
      groups[notification.type].push(notification);
    });

    return groups;
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4 text-red-500" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejection':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: az
      });
    } catch {
      return 'Bilinmir';
    }
  };

  const renderNotificationItem = (notification: UnifiedNotification) => (
    <div
      key={notification.id}
      className={`
        p-4 border rounded-lg transition-all hover:shadow-sm
        ${notification.is_read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`
                font-medium truncate
                ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}
              `}>
                {notification.title}
              </h4>
              
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
            
            {notification.message && (
              <p className={`
                text-sm mt-1 line-clamp-3
                ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}
              `}>
                {notification.message}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(notification.priority)}`}
              >
                {notification.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {notification.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatNotificationTime(notification.created_at)}
              </span>
            </div>

            {notification.metadata && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                {notification.metadata.category_name && (
                  <div>Kateqoriya: {notification.metadata.category_name}</div>
                )}
                {notification.metadata.deadline_date && (
                  <div>Son tarix: {notification.metadata.deadline_date}</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(notification.id)}
              title="Oxunmuş kimi işarələ"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteNotification(notification.id)}
            title="Sil"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bildirişlər</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Bildirişlər
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} oxunmamış
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Bütün bildirişlərinizi bu səhifədə idarə edin
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Hamısını oxu
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Bütün bildirişləri silmək istədiyinizə əminsiniz?')) {
                    clearAll();
                  }
                }}
                disabled={notifications.length === 0}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hamısını sil
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters and Search */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Bildirişlərdə axtar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Növ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün növlər</SelectItem>
                    <SelectItem value="deadline">Son tarix</SelectItem>
                    <SelectItem value="approval">Təsdiq</SelectItem>
                    <SelectItem value="rejection">Rədd</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                    <SelectItem value="data_entry">Məlumat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as any)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Prioritet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                    <SelectItem value="high">Yüksək</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Aşağı</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Ən yeni</SelectItem>
                    <SelectItem value="oldest">Ən köhnə</SelectItem>
                    <SelectItem value="priority">Prioritet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter summary */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>
                {filteredAndSortedNotifications.length} nəticə göstərilir
                {searchTerm && ` "${searchTerm}" axtarışı üçün`}
              </span>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                Hamısı ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Oxunmamış ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="deadline">
                Son tarix ({notificationsByType.deadline?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="approval">
                Təsdiq ({(notificationsByType.approval?.length || 0) + (notificationsByType.rejection?.length || 0)})
              </TabsTrigger>
              <TabsTrigger value="system">
                Sistem ({notificationsByType.system?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {filteredAndSortedNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Heç bir bildiriş tapılmadı</p>
                    {searchTerm && (
                      <p className="text-sm mt-2">
                        "{searchTerm}" axtarışına uyğun nəticə yoxdur
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedNotifications.map(renderNotificationItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {notifications.filter(n => !n.is_read).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Oxunmamış bildiriş yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications
                      .filter(n => !n.is_read)
                      .map(renderNotificationItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="deadline" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {(notificationsByType.deadline || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Son tarix bildirişi yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(notificationsByType.deadline || []).map(renderNotificationItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="approval" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {[...(notificationsByType.approval || []), ...(notificationsByType.rejection || [])].length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Təsdiq bildirişi yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...(notificationsByType.approval || []), ...(notificationsByType.rejection || [])]
                      .map(renderNotificationItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="system" className="mt-6">
              <ScrollArea className="h-[600px] pr-4">
                {(notificationsByType.system || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sistem bildirişi yoxdur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(notificationsByType.system || []).map(renderNotificationItem)}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationList;
```

### 4. Real-time Notification Hooks Enhancement

**Fayl:** `src/notifications/hooks/index.ts` (yeniləmə)

```typescript
// Add to existing hooks file

/**
 * Hook for real-time notification management with dashboard integration
 */
export function useNotificationDashboard(userId?: string) {
  const notificationData = useNotifications(userId);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Track connection status
  useEffect(() => {
    if (!userId) return;

    const channel = notificationManager.addEventListener('notification_created', (event) => {
      if (event.user_id === userId) {
        setConnectionStatus('connected');
        setLastUpdate(new Date());
      }
    });

    const healthCheckInterval = setInterval(() => {
      const health = notificationManager.getHealth();
      setConnectionStatus(health.healthy ? 'connected' : 'disconnected');
    }, 30000);

    return () => {
      channel();
      clearInterval(healthCheckInterval);
    };
  }, [userId]);

  // Enhanced notification data with dashboard-specific features
  const dashboardNotifications = useMemo(() => {
    return {
      ...notificationData,
      connectionStatus,
      lastUpdate,
      
      // Quick access to specific notification types
      deadlineNotifications: notificationData.notifications.filter(n => n.type === 'deadline'),
      approvalNotifications: notificationData.notifications.filter(n => 
        ['approval', 'rejection'].includes(n.type)
      ),
      systemNotifications: notificationData.notifications.filter(n => n.type === 'system'),
      
      // Priority-based grouping
      criticalNotifications: notificationData.notifications.filter(n => 
        n.priority === 'critical' && !n.is_read
      ),
      
      // Recent notifications (last 24 hours)
      recentNotifications: notificationData.notifications.filter(n => {
        const notificationDate = new Date(n.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return notificationDate > yesterday;
      }),
    };
  }, [notificationData, connectionStatus, lastUpdate]);

  return dashboardNotifications;
}

/**
 * Hook for notification sound and visual effects
 */
export function useNotificationEffects(userId?: string, options: {
  enableSound?: boolean;
  enableVisualEffects?: boolean;
  soundUrl?: string;
} = {}) {
  const { enableSound = true, enableVisualEffects = true, soundUrl = '/notification-sound.mp3' } = options;
  const { notifications } = useNotifications(userId);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  // Play sound for new notifications
  useEffect(() => {
    if (!enableSound || notifications.length === 0) return;

    const latestNotification = notifications[0];
    if (latestNotification.id !== lastNotificationId) {
      // Check if this is a new notification (created in the last minute)
      const isRecent = new Date(latestNotification.created_at).getTime() > Date.now() - 60000;
      
      if (isRecent && !latestNotification.is_read) {
        // Play sound
        const audio = new Audio(soundUrl);
        audio.volume = 0.3;
        audio.play().catch(console.error);
        
        setLastNotificationId(latestNotification.id);
      }
    }
  }, [notifications, enableSound, soundUrl, lastNotificationId]);

  // Visual effects for new notifications
  useEffect(() => {
    if (!enableVisualEffects || notifications.length === 0) return;

    const latestNotification = notifications[0];
    const isRecent = new Date(latestNotification.created_at).getTime() > Date.now() - 60000;
    
    if (isRecent && !latestNotification.is_read) {
      // Flash favicon or title
      const originalTitle = document.title;
      const flashTitle = `🔔 ${originalTitle}`;
      
      document.title = flashTitle;
      
      setTimeout(() => {
        document.title = originalTitle;
      }, 3000);

      // Request notification permission and show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(latestNotification.title, {
          body: latestNotification.message,
          icon: '/favicon.ico',
          tag: latestNotification.id
        });
      }
    }
  }, [notifications, enableVisualEffects]);

  return {
    requestNotificationPermission: () => {
      if ('Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied');
    }
  };
}
```

### 5. App-level Notification Provider Integration

**Fayl:** `src/App.tsx` (yeniləmə)

```typescript
import { Suspense } from "react";
import { Toaster } from "sonner";
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import TranslationWrapper from "./components/translation/TranslationWrapper";
import { UnifiedNotificationProvider } from "@/notifications";
import { useAuth } from "@/lib/auth";
import "./App.css";
import "./styles/enhanced-data-entry.css";

// Simple loading fallback
const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">İnfoLine yüklənir...</p>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <TranslationWrapper skipLoading={true}>
        <UnifiedNotificationProvider 
          userId={user?.id}
          enableToasts={true}
          toastConfig={{
            position: 'top-right',
            duration: 5000,
            showOnlyHighPriority: false
          }}
        >
          <Suspense fallback={<AppLoading />}>
            <AppRoutes />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton
              duration={4000}
            />
          </Suspense>
        </UnifiedNotificationProvider>
      </TranslationWrapper>
    </ErrorBoundary>
  );
}

export default App;
```

## ✅ Yoxlama Addımları

1. **Real-time connection test:**
   ```typescript
   // Browser console-da test edin
   const { connectionStatus } = useNotificationDashboard(userId);
   console.log('Connection status:', connectionStatus);
   ```

2. **Dashboard integration test:**
   - NotificationsCard komponentini dashboard-lara əlavə edin
   - Real-time updates-in işlədiyini yoxlayın
   - Unread count badge-lərinin düzgün göründüyünü yoxlayın

3. **Performance test:**
   ```bash
   # Network tab-da WebSocket connections yoxlayın
   # Memory usage-ı monitor edin
   # Real-time events-lərin performance impact-ini ölçün
   ```

4. **Mobile responsive test:**
   - NotificationList komponentini mobil cihazlarda test edin
   - Touch interactions-ın işlədiyini yoxlayın

## 🔄 Növbəti Addım

Bu step tamamlandıqdan sonra [Step 5: UI Components Enhancement](./05-ui-enhancement.md) addımına keçin.

## 📚 Əlaqəli Fayllar

- `src/components/dashboard/` - dashboard komponentləri
- `src/notifications/hooks/index.ts` - notification hooks
- `src/pages/dashboard/` - dashboard səhifələri
- `src/App.tsx` - app-level integration

---

**Status:** 📋 Ready for implementation
**Estimated time:** 1 gün
**Dependencies:** Step 1, 2, 3 (Database, Email Templates, User Preferences)