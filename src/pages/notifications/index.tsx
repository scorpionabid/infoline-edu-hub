/**
 * Notifications Page 
 * Tam notification siyahısı və idarəetmə üçün səhifə
 */

import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useNotifications } from '@/notifications';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Eye,
  // Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [filterPriority, setFilterPriority] = React.useState<string>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // clearAll
  } = useNotifications(user?.id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': {
      case 'warning': {
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'success': {
      case 'approval': {
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': {
      case 'rejection': {
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info': {
      case 'system': {
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': {
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high': {
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': {
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  // Filter notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notification => notification.type === filterType);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filterPriority);
    }

    return filtered;
  }, [notifications, searchTerm, filterType, filterPriority]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Bildirişlər
          </h1>
          <p className="text-muted-foreground">
            Bütün bildirişlərinizi və xəbərdarlıqlarınızı idarə edin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/profile?tab=notifications">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              // Ayarlar
            </Button>
          </Link>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              size="sm"
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Hamısını oxu ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ümumi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Oxunmamış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bu gün</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return new Date(n.created_at) >= today;
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kritik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.priority === 'critical' && !n.is_read).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bütün Bildirişlər</CardTitle>
              <CardDescription>
                {filteredNotifications.length} bildiriş göstərilir
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
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
          {/* Filters */}
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Növ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Bütün növlər</SelectItem>
                    <SelectItem value="deadline">Son tarix</SelectItem>
                    <SelectItem value="approval">Təsdiq</SelectItem>
                    <SelectItem value="rejection">Rədd</SelectItem>
                    <SelectItem value="system">Sistem</SelectItem>
                    <SelectItem value="info">Məlumat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Prioritet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                    <SelectItem value="high">Yüksək</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>
                {filteredNotifications.length} nəticə göstərilir
                {searchTerm && ` "${searchTerm}" axtarışı üçün`}
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
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
                {filteredNotifications.map((notification) => (
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
                              font-medium line-clamp-2
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
                            <Eye className="w-4 h-4" />
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
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;